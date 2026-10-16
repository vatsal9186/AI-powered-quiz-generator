import os
import sys
import time
from unittest.mock import patch, MagicMock

# Add app parent directory to path
sys.path.insert(0, os.path.realpath(os.path.dirname(__file__) + "/.."))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import main
from app.database import Base, get_db
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

# Patch SessionLocal so background tasks also use the in-memory DB during tests
import app.database
app.database.SessionLocal = TestingSessionLocal

# Initialize database tables and columns
Base.metadata.create_all(bind=engine)

# Run the self-healing migration logic to check it runs smoothly
main.ensure_db_schema_up_to_date()

client = TestClient(main.app)

def test_asynchronous_pipeline():
    print("Starting Asynchronous Pipeline Integration Tests...")
    
    db = TestingSessionLocal()
    
    # Cleanup test users to ensure repeatability on PostgreSQL
    db.query(models.User).filter(models.User.email == "student_async@example.com").delete(synchronize_session=False)
    db.commit()
    
    # 1. Register and log in a student user
    register_res = client.post(
        "/api/auth/register",
        json={"email": "student_async@example.com", "password": "password123", "full_name": "Async Student"}
    )
    assert register_res.status_code == 201
    
    login_res = client.post(
        "/api/auth/login",
        json={"email": "student_async@example.com", "password": "password123"}
    ).json()
    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Prepare dummy PDF bytes
    dummy_pdf = b"%PDF-1.5\n%..." + b"A" * 100
    
    # Mock validation and extraction so it doesn't try to parse real PDF
    with patch("app.routers.documents.validate_uploaded_file") as mock_validate, \
         patch("app.routers.documents.extract_text_for_validated_file") as mock_extract, \
         patch("app.routers.documents.analyze_document") as mock_analyze:
         
        mock_validate.return_value = "pdf"
        mock_extract.return_value = "Chapter 1: Intro to Async. This is some text about async queues and background loops. We need to write a sufficiently long guide here to satisfy the minimum 100 character threshold for academic quiz generation evaluation."
        mock_analyze.return_value = {
            "document_title": "Async Study Guide",
            "structure": [
                {
                    "module_title": "Module 1: Background Tasks",
                    "chapters": [
                        {
                            "chapter_title": "Chapter 1: Intro to Async",
                            "topics": ["Background Loops", "Task Queues"],
                            "content": "This is some text about async queues and background loops. We need to write a sufficiently long guide here to satisfy the minimum 100 character threshold for academic quiz generation evaluation."
                        }
                    ]
                }
            ]
        }
        
        # 2. Upload document - should return immediately with status 'processing'
        print("Uploading document (should return immediately)...")
        upload_res = client.post(
            "/api/documents/upload",
            files={"file": ("guide.pdf", dummy_pdf, "application/pdf")},
            headers=headers
        )
        assert upload_res.status_code == 201
        doc_data = upload_res.json()
        assert doc_data["status"] == "processing"
        assert doc_data["error_message"] is None
        doc_id = doc_data["id"]
        
        # Wait a short moment to let FastAPI background tasks execute on this thread
        time.sleep(0.5)
        
        # 3. Poll document details - should be updated to 'ready'
        print("Polling document details...")
        poll_res = client.get(f"/api/documents/{doc_id}", headers=headers)
        assert poll_res.status_code == 200
        updated_doc = poll_res.json()
        assert updated_doc["status"] == "ready"
        assert updated_doc["title"] == "Async Study Guide"
        assert len(updated_doc["structure"]) == 1
        assert updated_doc["structure"][0]["title"] == "Module 1: Background Tasks"
        assert updated_doc["structure"][0]["chapters"][0]["title"] == "Chapter 1: Intro to Async"

    # Mock Gemini quiz generation
    with patch("app.routers.quizzes.generate_quiz_questions") as mock_gen_quiz:
        mock_gen_quiz.return_value = [
            {
                "question": "What is a key benefit of background tasks?",
                "options": [
                    "They block the main execution flow",
                    "They allow the server to return responses immediately",
                    "They slow down page loads",
                    "They expose API keys"
                ],
                "correct_answer": "They allow the server to return responses immediately",
                "explanation": "Background tasks process intensive operations out-of-band to prevent UI locking.",
                "difficulty": "easy",
                "source_chapter": "Chapter 1: Intro to Async"
            }
        ]
        
        # 4. Generate quiz - should return immediately with status 'generating'
        print("Generating quiz (should return immediately)...")
        gen_res = client.post(
            "/api/quizzes/generate",
            json={
                "document_id": doc_id,
                "selected_chapters": ["Chapter 1: Intro to Async"],
                "difficulty": "easy",
                "num_questions": 1
            },
            headers=headers
        )
        assert gen_res.status_code == 200
        quiz_data = gen_res.json()
        assert quiz_data["status"] == "generating"
        quiz_id = quiz_data["id"]
        
        # Wait a short moment for background task
        time.sleep(0.5)
        
        # 5. Poll quiz status - should be updated to 'completed'
        print("Polling quiz details...")
        quiz_poll_res = client.get(f"/api/quizzes/{quiz_id}", headers=headers)
        assert quiz_poll_res.status_code == 200
        updated_quiz = quiz_poll_res.json()
        print("Quiz data returned:", updated_quiz)
        assert updated_quiz["status"] == "completed"
        assert len(updated_quiz["questions"]) == 1
        assert updated_quiz["questions"][0]["question_text"] == "What is a key benefit of background tasks?"
        
    print("[OK] Asynchronous Pipeline Integration Tests passed.")
    db.close()

if __name__ == "__main__":
    test_asynchronous_pipeline()
