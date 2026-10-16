from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import sys
import os
from unittest.mock import patch, AsyncMock

# Add app parent directory to path
sys.path.insert(0, os.path.realpath(os.path.dirname(__file__)))

from app import main
from app.database import Base, get_db
from app.utils.file_validator import validate_uploaded_file, FileValidationError
import app.models as models
from app.config import settings

# Use PostgreSQL configured in the project settings
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,
    pool_pre_ping=True
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

main.app.dependency_overrides[get_db] = override_get_db

# Initialize database
Base.metadata.create_all(bind=engine)
client = TestClient(main.app)

def test_file_validation():
    print("Running File Validation Tests...")
    
    # 1. Test empty file validation
    try:
        validate_uploaded_file(b"", "doc.pdf")
        assert False, "Empty file should have failed"
    except FileValidationError as e:
        assert e.error_code == "INVALID_FILE"
        assert e.status_code == 400
        
    # 2. Test file size validation (> 100MB)
    try:
        validate_uploaded_file(b"a" * (100 * 1024 * 1024 + 1), "doc.pdf")
        assert False, "Oversized file should have failed"
    except FileValidationError as e:
        assert e.error_code == "FILE_TOO_LARGE"
        
    # 3. Test invalid extension
    try:
        validate_uploaded_file(b"%PDF-1.5...", "doc.exe")
        assert False, "Unsupported extension should have failed"
    except FileValidationError as e:
        assert e.error_code == "UNSUPPORTED_FILE_TYPE"

    # 4. Test corrupted PDF (magic header correct, but cannot parse)
    try:
        validate_uploaded_file(b"%PDF-1.5\ncorrupted_data", "doc.pdf")
        assert False, "Corrupted PDF should have failed in reader"
    except FileValidationError as e:
        assert e.error_code == "INVALID_FILE"

    # 5. Test PDF with prepended BOM / spaces (magic signature check tolerance check)
    try:
        validate_uploaded_file(b"   \n \xef\xbb\xbf%PDF-1.5\ncorrupted_data", "doc.pdf")
        assert False, "Should have passed signature check but failed PDF reader parsing"
    except FileValidationError as e:
        assert e.error_code == "INVALID_FILE"
        
    print("[OK] File Validation Tests passed.")

def test_admin_and_quiz_grading():
    print("\nRunning Admin & Quiz Grading Integration Tests...")
    
    db = TestingSessionLocal()
    
    # Cleanup test users to ensure repeatability on PostgreSQL
    db.query(models.User).filter(models.User.email.in_(["student@example.com", "admin@example.com"])).delete(synchronize_session=False)
    db.commit()
    
    # 1. Register a regular user and an admin user
    reg_user = client.post(
        "/api/auth/register",
        json={"email": "student@example.com", "password": "password123", "full_name": "Student User"}
    )
    assert reg_user.status_code == 201
    
    admin_user = client.post(
        "/api/auth/register",
        json={"email": "admin@example.com", "password": "password123", "full_name": "Admin User"}
    )
    assert admin_user.status_code == 201
    
    # Manually promote admin_user to admin role
    db_admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
    db_admin.role = "admin"
    db.add(db_admin)
    db.commit()
    
    # Log in both using the Swagger endpoint to get real tokens for multiclient header simulation
    student_login = client.post("/api/auth/login-swagger", data={"username": "student@example.com", "password": "password123"}).json()
    student_token = student_login["access_token"]
    
    admin_login = client.post("/api/auth/login-swagger", data={"username": "admin@example.com", "password": "password123"}).json()
    admin_token = admin_login["access_token"]
    
    # 2. Test user access to Admin Endpoints (should be forbidden)
    print("Testing Role Authorization on Admin route...")
    admin_stats_fail = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {student_token}"})
    assert admin_stats_fail.status_code == 403, f"Regular user got access to admin: {admin_stats_fail.text}"
    
    # Test admin access to Admin stats (should succeed)
    admin_stats_ok = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_stats_ok.status_code == 200
    assert admin_stats_ok.json()["success"] is True
    
    # 3. Create a manual quiz (Student)
    print("Testing manual quiz creation...")
    quiz_payload = {
        "title": "Manual Test Quiz",
        "description": "A manual test quiz",
        "difficulty": "medium",
        "questions": [
            {
                "question_text": "What is 2 + 2?",
                "type": "mcq",
                "explanation": "2 + 2 equals 4",
                "points": 1,
                "options": [
                    {"option_text": "3", "is_correct": False},
                    {"option_text": "4", "is_correct": True},
                    {"option_text": "5", "is_correct": False},
                    {"option_text": "6", "is_correct": False}
                ]
            }
        ]
    }
    
    create_res = client.post(
        "/api/quizzes/create",
        json=quiz_payload,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert create_res.status_code == 201, f"Failed to create manual quiz: {create_res.text}"
    quiz_data = create_res.json()
    quiz_id = quiz_data["id"]
    question_id = quiz_data["questions"][0]["id"]
    correct_option_id = [opt["id"] for opt in quiz_data["questions"][0]["options"] if opt.get("id") and db.query(models.Option).filter(models.Option.id == opt["id"]).first().is_correct][0]
    incorrect_option_id = [opt["id"] for opt in quiz_data["questions"][0]["options"] if opt["id"] != correct_option_id][0]
    
    # 4. Submit correct and incorrect answers to verify grading calculations
    print("Testing Quiz submissions & grading...")
    
    # Incorrect submission
    submit_fail_res = client.post(
        f"/api/quizzes/{quiz_id}/submit",
        json={
            "time_spent": 30,
            "answers": [{"question_id": question_id, "selected_option_id": incorrect_option_id}]
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert submit_fail_res.status_code == 200
    assert submit_fail_res.json()["score"] == 0.0
    
    # Correct submission
    submit_ok_res = client.post(
        f"/api/quizzes/{quiz_id}/submit",
        json={
            "time_spent": 45,
            "answers": [{"question_id": question_id, "selected_option_id": correct_option_id}]
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert submit_ok_res.status_code == 200
    assert submit_ok_res.json()["score"] == 100.0
    attempt_id = submit_ok_res.json()["id"]
    
    # 5. Fetch attempt details
    print("Testing attempt details retrieval...")
    attempt_details = client.get(
        f"/api/quizzes/attempts/{attempt_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert attempt_details.status_code == 200
    assert attempt_details.json()["score"] == 100.0
    assert len(attempt_details.json()["answers"]) == 1
    assert attempt_details.json()["answers"][0]["is_correct"] is True
    
    # 6. Verify admin stats updated
    admin_stats_updated = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"}).json()
    assert admin_stats_updated["data"]["total_users"] >= 2
    assert admin_stats_updated["data"]["total_quizzes"] >= 1
    assert admin_stats_updated["data"]["total_attempts"] >= 2
    
    print("[OK] Admin & Quiz Grading Integration Tests passed.")
    db.close()

if __name__ == "__main__":
    test_file_validation()
    test_admin_and_quiz_grading()
    print("\n=======================================================")
    print("  ALL ADVANCED INTEGRATION TESTS PASSED SUCCESSFULLY!  ")
    print("=======================================================")
