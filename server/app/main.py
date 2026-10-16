from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import Base, engine, get_db
import app.models as models  # Ensure models are imported for metadata creation
from app.config import settings
from app.routers import auth, users, documents, quizzes, admin

def ensure_db_schema_up_to_date():
    from sqlalchemy import inspect, text
    from app.database import engine
    
    try:
        inspector = inspect(engine)
        
        # We can execute ALTER TABLE SQLs directly on engine if columns are missing
        with engine.begin() as conn:
            # 1. Documents columns
            if "documents" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("documents")]
                if "status" not in columns:
                    print("Adding column 'status' to table 'documents'...")
                    conn.execute(text("ALTER TABLE documents ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'processing'"))
                if "error_message" not in columns:
                    print("Adding column 'error_message' to table 'documents'...")
                    conn.execute(text("ALTER TABLE documents ADD COLUMN error_message TEXT"))
            
            # 2. Quizzes columns
            if "quizzes" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("quizzes")]
                if "document_id" not in columns:
                    print("Adding column 'document_id' to table 'quizzes'...")
                    conn.execute(text("ALTER TABLE quizzes ADD COLUMN document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL"))
                if "status" not in columns:
                    print("Adding column 'status' to table 'quizzes'...")
                    conn.execute(text("ALTER TABLE quizzes ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'completed'"))
                if "error_message" not in columns:
                    print("Adding column 'error_message' to table 'quizzes'...")
                    conn.execute(text("ALTER TABLE quizzes ADD COLUMN error_message TEXT"))
            
            # 3. Questions columns
            if "questions" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("questions")]
                if "source_chapter" not in columns:
                    print("Adding column 'source_chapter' to table 'questions'...")
                    conn.execute(text("ALTER TABLE questions ADD COLUMN source_chapter VARCHAR(255)"))
                if "difficulty" not in columns:
                    print("Adding column 'difficulty' to table 'questions'...")
                    conn.execute(text("ALTER TABLE questions ADD COLUMN difficulty VARCHAR(50)"))

            # 4. Users columns
            if "users" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("users")]
                if "phone_number" not in columns:
                    print("Adding column 'phone_number' to table 'users'...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR(50)"))

            # 5. PasswordResetOTP columns
            if "password_reset_otps" in inspector.get_table_names():
                cols_info = {col["name"]: col for col in inspector.get_columns("password_reset_otps")}
                columns = list(cols_info.keys())
                if "verification_method" not in columns:
                    print("Adding column 'verification_method' to table 'password_reset_otps'...")
                    conn.execute(text("ALTER TABLE password_reset_otps ADD COLUMN verification_method VARCHAR(20) NOT NULL DEFAULT 'sms'"))
                if "email" not in columns:
                    print("Adding column 'email' to table 'password_reset_otps'...")
                    conn.execute(text("ALTER TABLE password_reset_otps ADD COLUMN email VARCHAR(255)"))
                if "phone_number" in cols_info and not cols_info["phone_number"].get("nullable", True):
                    print("Making column 'phone_number' nullable in table 'password_reset_otps'...")
                    try:
                        conn.execute(text("ALTER TABLE password_reset_otps ALTER COLUMN phone_number DROP NOT NULL"))
                    except Exception as ex:
                        print(f"[SCHEMA CHECK] Could not drop NOT NULL on phone_number: {ex}")
                if "email" in cols_info and not cols_info["email"].get("nullable", True):
                    print("Making column 'email' nullable in table 'password_reset_otps'...")
                    try:
                        conn.execute(text("ALTER TABLE password_reset_otps ALTER COLUMN email DROP NOT NULL"))
                    except Exception as ex:
                        print(f"[SCHEMA CHECK] Could not drop NOT NULL on email: {ex}")
                    
        print("Database self-healing migration checks completed successfully.")
    except Exception as e:
        print(f"Error during self-healing database schema checks: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run the self-healing migration checks
    ensure_db_schema_up_to_date()
    
    # Attempt to create database tables on startup (as a fallback)
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"CRITICAL: Failed to initialize database tables: {e}")
        
    # Clean up stuck processing statuses on startup
    try:
        with engine.begin() as conn:
            # Mark stuck documents as failed
            conn.execute(
                text(
                    "UPDATE documents SET status = 'failed', error_message = 'System restarted during processing.' "
                    "WHERE status IN ('processing', 'extracting', 'detecting', 'generating_quiz')"
                )
            )
            # Mark stuck quizzes as failed
            conn.execute(
                text(
                    "UPDATE quizzes SET status = 'failed', error_message = 'System restarted during generation.' "
                    "WHERE status = 'generating'"
                )
            )
        print("Stuck document and quiz processing states cleared successfully.")
    except Exception as e:
        print(f"Error during startup processing cleanup: {e}")
    yield

from app.utils.file_validator import FileValidationError
from fastapi.responses import JSONResponse

app = FastAPI(
    title="AI Powered Quiz Generator Backend",
    description="FastAPI Backend with PostgreSQL database integration.",
    version="1.0.0",
    lifespan=lifespan
)

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

# Configure logger
logger = logging.getLogger("questai_backend")
logging.basicConfig(level=logging.INFO)

@app.exception_handler(FileValidationError)
async def file_validation_error_handler(request, exc: FileValidationError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "detail": exc.message,
            "error_code": exc.error_code
        }
    )

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc: StarletteHTTPException):
    status_code = exc.status_code
    detail = exc.detail
    message = str(detail)
    error_code = "HTTP_EXCEPTION"
    
    if isinstance(detail, dict):
        message = detail.get("message", message)
        error_code = detail.get("error_code", error_code)
        detail = detail.get("detail", detail)
        
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "detail": message,
            "error_code": error_code
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc.errors()}")
    
    error_details = []
    for error in exc.errors():
        loc_str = ".".join(str(p) for p in error.get("loc", []))
        error_details.append(f"{loc_str}: {error.get('msg', 'invalid value')}")
        
    message = "Validation failed: " + "; ".join(error_details)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": message,
            "detail": message,
            "error_code": "VALIDATION_ERROR"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    logger.error(f"Unhandled server error: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected server error occurred. Please contact an administrator.",
            "detail": "An unexpected server error occurred.",
            "error_code": "INTERNAL_SERVER_ERROR"
        }
    )

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
)


# Register Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(documents.router)
app.include_router(quizzes.router)
app.include_router(admin.router)

@app.get("/")
def home():
    return {
        "success": True,
        "message": "FastAPI Working",
        "database_status": "Ready. Use /health or /db-check to verify PostgreSQL connection."
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "success": True,
            "status": "healthy",
            "message": "QuestAI Backend is fully operational."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "status": "unhealthy",
                "message": "Database connection failed.",
                "error": str(e)
            }
        )

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        # Run a simple query to verify connection
        db.execute(text("SELECT 1"))
        
        # List of tables registered in SQLAlchemy metadata
        registered_tables = list(Base.metadata.tables.keys())
        
        return {
            "status": "healthy",
            "database_connection": "successful",
            "registered_tables": registered_tables
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "unhealthy",
                "database_connection": "failed",
                "error": str(e)
            }
        )