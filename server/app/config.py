import os
from pathlib import Path
from dotenv import load_dotenv

# Load env variables from the server root folder
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "AI Powered Quiz Generator Backend"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:1234@localhost:5432/quiz_generator"
    )
    
    # CORS Origins
    CORS_ORIGINS: list = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:3000,http://127.0.0.1:5174"
        ).split(",") if origin.strip()
    ]

    
    # JWT Security Settings
    # Use a secure fallback or generate one if not provided in environment
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv(
        "GOOGLE_CLIENT_ID",
        "1004732812510-edmdaplkjbo36jatfesoiq4b341g0hb1.apps.googleusercontent.com"
    )
    
    # Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or ""
    GEMINI_API_KEY_2: str = os.getenv("GEMINI_API_KEY_2") or ""
    
    # Fast Upload Mode (bypasses Gemini API for faster layout structure extraction during uploads)
    FAST_UPLOAD_MODE: bool = os.getenv("FAST_UPLOAD_MODE", "true").lower() in ("true", "1", "yes")
    
    # OTP Security Settings
    OTP_EXPIRY_MINUTES: int = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))
    OTP_MAX_ATTEMPTS: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
    OTP_RESEND_COOLDOWN_SECONDS: int = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))
    
    # Dynamic SMS & Email Gateway Settings
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "")
    SMS_API_KEY: str = os.getenv("SMS_API_KEY", "")
    SMS_API_SECRET: str = os.getenv("SMS_API_SECRET", "")
    SMS_SENDER_ID: str = os.getenv("SMS_SENDER_ID", "")
    
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    FAST2SMS_API_KEY: str = os.getenv("FAST2SMS_API_KEY", "")
    FAST2SMS_OTP_ID: str = os.getenv("FAST2SMS_OTP_ID", "")
    TEXTBELT_API_KEY: str = os.getenv("TEXTBELT_API_KEY", "")
    TWOFACTOR_API_KEY: str = os.getenv("TWOFACTOR_API_KEY", "")
    
    # Email Verification & Transport Settings
    EMAIL_HOST: str = os.getenv("EMAIL_HOST") or os.getenv("SMTP_HOST") or "smtp.gmail.com"
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT") or os.getenv("SMTP_PORT") or "587")
    EMAIL_USERNAME: str = os.getenv("EMAIL_USERNAME") or os.getenv("SMTP_USER") or os.getenv("SMTP_USERNAME") or ""
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD") or os.getenv("SMTP_PASSWORD") or ""
    EMAIL_FROM: str = os.getenv("EMAIL_FROM") or os.getenv("SMTP_FROM_EMAIL") or os.getenv("SMTP_USER") or ""
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME") or os.getenv("SMTP_FROM_NAME") or "AI Quiz Generator"
    
    SMTP_HOST: str = os.getenv("SMTP_HOST") or os.getenv("EMAIL_HOST") or "smtp.gmail.com"
    SMTP_PORT: int = int(os.getenv("SMTP_PORT") or os.getenv("EMAIL_PORT") or "587")
    SMTP_USER: str = os.getenv("SMTP_USER") or os.getenv("SMTP_USERNAME") or os.getenv("EMAIL_USERNAME") or ""
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME") or os.getenv("SMTP_USER") or os.getenv("EMAIL_USERNAME") or ""
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASSWORD") or ""
    SMTP_FROM: str = os.getenv("SMTP_FROM") or os.getenv("SMTP_FROM_EMAIL") or os.getenv("EMAIL_FROM") or os.getenv("SMTP_USERNAME") or os.getenv("SMTP_USER") or ""
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL") or os.getenv("SMTP_FROM") or os.getenv("EMAIL_FROM") or ""
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME") or os.getenv("EMAIL_FROM_NAME") or "AI Quiz Generator"



settings = Settings()

