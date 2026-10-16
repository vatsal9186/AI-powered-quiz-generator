from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

from sqlalchemy import text

# Create engine with PostgreSQL or SQLite auto-fallback support
db_url = settings.DATABASE_URL

# Normalize postgres:// to postgresql:// (required by SQLAlchemy for Supabase/Render URLs)
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url.startswith("sqlite"):
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False}
    )
else:
    try:
        temp_engine = create_engine(
            db_url,
            pool_size=5,
            pool_recycle=300,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 10}
        )
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine = temp_engine
        print("[INFO] Successfully connected to PostgreSQL database.")
    except Exception as e:
        print(f"[WARNING] PostgreSQL connection unavailable: {e}")
        print("[INFO] Automatically using SQLite database (quiz_generator.db)...")
        settings.DATABASE_URL = "sqlite:///./quiz_generator.db"
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False}
        )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for SQLAlchemy models
Base = declarative_base()

# FastAPI Dependency to get DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

