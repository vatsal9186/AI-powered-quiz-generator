import os
import sys
from pathlib import Path

# Add server directory to sys.path
server_dir = Path(__file__).resolve().parent
if str(server_dir) not in sys.path:
    sys.path.insert(0, str(server_dir))

from sqlalchemy import create_engine, text
from app.database import Base
import app.models as models
from sync_sqlite_to_pg import sync_data

def migrate(supabase_url: str):
    if supabase_url.startswith("postgres://"):
        supabase_url = supabase_url.replace("postgres://", "postgresql://", 1)
        
    print(f"Connecting to Supabase Database...")
    engine = create_engine(supabase_url, pool_pre_ping=True)
    
    with engine.connect() as conn:
        res = conn.execute(text("SELECT version();")).fetchone()
        print(f"[SUCCESS] Connected to PostgreSQL: {res[0][:40]}...")
    
    print("Creating all database tables (users, documents, quizzes, questions, etc.)...")
    Base.metadata.create_all(bind=engine)
    print("[SUCCESS] All database tables created in Supabase!")
    
    print("Syncing existing data from SQLite into Supabase...")
    sync_data(supabase_url)
    print("\n🎉 ALL MIGRATIONS AND DATA SYNC COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else os.getenv("DATABASE_URL")
    if not url:
        print("Usage: python migrate_supabase.py '<YOUR_SUPABASE_CONNECTION_STRING>'")
        sys.exit(1)
    migrate(url)
