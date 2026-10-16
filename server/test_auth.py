from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add app parent directory to path
sys.path.insert(0, os.path.realpath(os.path.dirname(__file__)))

from sqlalchemy.pool import StaticPool
from app import main
from app.database import Base, get_db

# Create an in-memory SQLite database for testing with StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency to use the in-memory test database
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

main.app.dependency_overrides[get_db] = override_get_db

# Ensure models are imported so they register on Base.metadata
import app.models

# Initialize database tables
Base.metadata.create_all(bind=engine)

client = TestClient(main.app)

def test_auth_flow():
    print("Starting integration tests...")
    
    # 1. Register a new user
    print("Testing registration...")
    reg_response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "password123", "full_name": "Test User"}
    )
    assert reg_response.status_code == 201, f"Reg failed: {reg_response.text}"
    reg_data = reg_response.json()
    assert reg_data["email"] == "test@example.com"
    assert reg_data["full_name"] == "Test User"
    assert "hashed_password" not in reg_data
    
    # 2. Try registering duplicate email
    print("Testing duplicate registration prevention...")
    dup_response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "newpassword", "full_name": "Dup User"}
    )
    assert dup_response.status_code == 400
    
    # 3. Log in with correct credentials
    print("Testing login with correct credentials...")
    login_response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["user_email"] == "test@example.com"
    token = login_data["access_token"]
    
    # 4. Log in with incorrect credentials
    print("Testing login failure with invalid password...")
    bad_login = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"}
    )
    assert bad_login.status_code == 401
    
    # 5. Access profile page with valid JWT
    print("Testing profile retrieval with valid JWT...")
    profile_response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_response.status_code == 200, f"Profile load failed: {profile_response.text}"
    profile_data = profile_response.json()
    assert profile_data["email"] == "test@example.com"
    assert profile_data["full_name"] == "Test User"
    
    # 6. Access profile page without token
    print("Testing unauthorized profile access (no token)...")
    client.cookies.clear()
    unauth_response = client.get("/api/users/me")
    assert unauth_response.status_code == 401
    
    # 7. Update profile
    print("Testing profile updates (modifying full name)...")
    login_again = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert login_again.status_code == 200
    update_response = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Updated Name"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["full_name"] == "Updated Name"
    
    # Verify change reflected in GET request
    get_updated = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert get_updated.json()["full_name"] == "Updated Name"
    
    # 8. Google SSO Login with mock token
    print("Testing Google SSO authentication...")
    from unittest.mock import patch, AsyncMock
    
    with patch("app.routers.auth.verify_google_id_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = {
            "email": "google_user@gmail.com",
            "full_name": "Google_user Google",
            "google_id": "google_sso_mock_google_token_google_user",
            "picture": "https://example.com/avatar.png"
        }
        google_response = client.post(
            "/api/auth/google",
            json={"id_token": "mock_google_token_google_user"}
        )
        assert google_response.status_code == 200, f"Google auth failed: {google_response.text}"
        google_data = google_response.json()
        assert "access_token" in google_data
        assert google_data["user_email"] == "google_user@gmail.com"
        assert google_data["user_name"] == "Google_user Google"
        assert google_data["user_avatar"] == "https://example.com/avatar.png"
    
    # 9. Test Send OTP for registered user
    print("Testing Send OTP for registered email...")
    otp_resp = client.post(
        "/api/auth/send-otp",
        json={"email": "test@example.com"}
    )

    assert otp_resp.status_code == 200, f"Send OTP failed: {otp_resp.text}"
    otp_data = otp_resp.json()
    assert "reference_id" in otp_data
    assert "demo_otp" not in otp_data  # Confirm OTP is NOT returned in API response!
    ref_id = otp_data["reference_id"]

    # Test Resend Cooldown (Immediate resend should trigger 429)
    print("Testing Resend OTP cooldown enforcement...")
    cooldown_resp = client.post(
        "/api/auth/send-otp",
        json={"email": "test@example.com"}
    )

    assert cooldown_resp.status_code == 429, f"Cooldown failed: {cooldown_resp.text}"

    # Query DB directly in test environment to test verification logic
    db = TestingSessionLocal()
    otp_record = db.query(app.models.PasswordResetOTP).filter(app.models.PasswordResetOTP.reference_id == ref_id).first()
    assert otp_record is not None
    db.close()


    # 10. Test Verify OTP with Incorrect Code
    print("Testing Verify OTP with incorrect code...")
    wrong_otp_resp = client.post(
        "/api/auth/verify-otp",
        json={"reference_id": ref_id, "otp_code": "000000"}
    )
    assert wrong_otp_resp.status_code == 400

    # 11. Test Reset Password without OTP authorization
    print("Testing Reset Password with invalid token...")
    invalid_reset = client.post(
        "/api/auth/reset-password",
        json={"reset_token": "invalid_token_xyz", "new_password": "newpassword123"}
    )
    assert invalid_reset.status_code == 400

    # Retrieve valid OTP from DB only for test verification (simulates user receiving SMS)
    # We test verify_otp_hash to find the actual code generated
    test_otp_code = None
    for candidate in range(100000, 1000000):
        from app.utils.security import verify_otp_hash
        if verify_otp_hash(str(candidate), otp_record.otp_hash):
            test_otp_code = str(candidate)
            break
            
    assert test_otp_code is not None, "Could not find matching test OTP code in hash range"

    # 12. Test Verify OTP with Correct Code
    print("Testing Verify OTP with correct code...")
    valid_otp_resp = client.post(
        "/api/auth/verify-otp",
        json={"reference_id": ref_id, "otp_code": test_otp_code}
    )
    assert valid_otp_resp.status_code == 200, f"Verify OTP failed: {valid_otp_resp.text}"
    reset_token = valid_otp_resp.json()["reset_token"]
    assert reset_token is not None

    # 13. Test OTP Single-Use (Re-verifying same OTP should fail)
    print("Testing OTP single-use protection...")
    reverify_resp = client.post(
        "/api/auth/verify-otp",
        json={"reference_id": ref_id, "otp_code": test_otp_code}
    )
    assert reverify_resp.status_code == 400

    # 14. Test Reset Password with Authorized Token
    print("Testing Reset Password with authorized token...")
    reset_resp = client.post(
        "/api/auth/reset-password",
        json={"reset_token": reset_token, "new_password": "newpassword123"}
    )
    assert reset_resp.status_code == 200, f"Reset password failed: {reset_resp.text}"

    # 15. Verify login with NEW password
    print("Testing login with new password...")
    new_login_resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "newpassword123"}
    )
    assert new_login_resp.status_code == 200, f"Login with new password failed: {new_login_resp.text}"

    # Verify old password fails
    print("Testing login with old password (should fail)...")
    old_login_resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert old_login_resp.status_code == 401

    # 16. Test Email OTP with invalid email format
    print("Testing Email OTP with invalid email format...")
    inv_email_resp = client.post(
        "/api/auth/send-otp",
        json={"method": "email", "email": "invalidemailformat"}
    )
    assert inv_email_resp.status_code == 400

    # 17. Test Email OTP with unregistered email (creates/allows email verification)
    print("Testing Email OTP with unregistered email...")
    unreg_email_resp = client.post(
        "/api/auth/send-otp",
        json={"method": "email", "email": "unregistered_user@example.com"}
    )
    assert unreg_email_resp.status_code in (200, 400)


    # 18. Test Email OTP send for registered email
    print("Testing Email OTP send for registered user...")
    email_otp_resp = client.post(
        "/api/auth/send-otp",
        json={"method": "email", "email": "test@example.com"}
    )
    assert email_otp_resp.status_code == 200, f"Email OTP send failed: {email_otp_resp.text}"
    email_otp_data = email_otp_resp.json()
    assert email_otp_data["channel"] == "Email"
    email_ref_id = email_otp_data["reference_id"]

    # 19. Retrieve Email OTP from DB and verify
    print("Testing Email OTP verification & reset...")
    db = TestingSessionLocal()
    email_otp_record = db.query(app.models.PasswordResetOTP).filter(app.models.PasswordResetOTP.reference_id == email_ref_id).first()
    assert email_otp_record is not None
    assert email_otp_record.verification_method == "email"
    db.close()

    email_otp_code = None
    for candidate in range(100000, 1000000):
        from app.utils.security import verify_otp_hash
        if verify_otp_hash(str(candidate), email_otp_record.otp_hash):
            email_otp_code = str(candidate)
            break

    assert email_otp_code is not None

    email_verify_resp = client.post(
        "/api/auth/verify-otp",
        json={"reference_id": email_ref_id, "otp_code": email_otp_code}
    )
    assert email_verify_resp.status_code == 200
    email_reset_token = email_verify_resp.json()["reset_token"]

    email_reset_resp = client.post(
        "/api/auth/reset-password",
        json={"reset_token": email_reset_token, "new_password": "finalpassword456"}
    )
    assert email_reset_resp.status_code == 200

    # 20. Verify login with final password updated via Email OTP
    print("Testing login with password updated via Email OTP...")
    final_login_resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "finalpassword456"}
    )
    assert final_login_resp.status_code == 200

    print("\n=======================================================")
    print("  ALL 20 INTEGRATION TESTS (SMS & EMAIL) PASSED!       ")
    print("=======================================================")

if __name__ == "__main__":
    test_auth_flow()

