import os
import sys
from sqlalchemy import create_engine, MetaData, Table, inspect, text
from sqlalchemy.orm import sessionmaker

# Add server root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

def migrate():
    sqlite_url = "sqlite:///./quiz_generator.db"
    postgres_url = settings.DATABASE_URL
    
    print("=== Migration Started ===")
    print(f"Source (SQLite): {sqlite_url}")
    print(f"Destination (PostgreSQL): {postgres_url}")
    
    # Establish engines
    sqlite_engine = create_engine(sqlite_url)
    postgres_engine = create_engine(postgres_url)
    
    # Tables in order of dependencies (to avoid foreign key violations)
    tables_order = [
        "users",
        "documents",
        "quizzes",
        "modules",
        "chapters",
        "topics",
        "questions",
        "options",
        "quiz_attempts",
        "user_answers",
        "bookmarks"
    ]
    
    # 1. Clean PostgreSQL database (with CASCADE)
    print("\n1. Cleaning PostgreSQL database...")
    with postgres_engine.begin() as pg_conn:
        # Disable triggers to speed up and avoid constraints temporary issues
        pg_conn.execute(text("SET session_replication_role = 'replica';"))
        try:
            for table_name in reversed(tables_order):
                # Check if table exists in PostgreSQL
                inspector = inspect(postgres_engine)
                if table_name in inspector.get_table_names():
                    print(f"Clearing table '{table_name}' in PostgreSQL...")
                    pg_conn.execute(text(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;"))
        finally:
            pg_conn.execute(text("SET session_replication_role = 'origin';"))
            
    # 2. Copy data table by table
    print("\n2. Copying data from SQLite to PostgreSQL...")
    sqlite_meta = MetaData()
    postgres_meta = MetaData()
    
    with sqlite_engine.connect() as sqlite_conn, postgres_engine.begin() as pg_conn:
        # Disable triggers/constraints check on postgres during copy
        pg_conn.execute(text("SET session_replication_role = 'replica';"))
        
        try:
            for table_name in tables_order:
                # Load tables from metadata
                sqlite_table = Table(table_name, sqlite_meta, autoload_with=sqlite_engine)
                postgres_table = Table(table_name, postgres_meta, autoload_with=postgres_engine)
                
                # Fetch all rows from SQLite
                rows = sqlite_conn.execute(sqlite_table.select()).fetchall()
                if not rows:
                    print(f"Table '{table_name}' is empty in SQLite. Skipping.")
                    continue
                
                print(f"Copying {len(rows)} rows for table '{table_name}'...")
                
                # Insert rows into PostgreSQL
                for row in rows:
                    # Convert row to dict
                    row_dict = row._asdict()
                    pg_conn.execute(postgres_table.insert().values(**row_dict))
                
                print(f"Successfully copied table '{table_name}'.")
        finally:
            pg_conn.execute(text("SET session_replication_role = 'origin';"))
            
    # 3. Reset PostgreSQL sequences so auto-increment works correctly
    print("\n3. Resetting PostgreSQL ID sequences...")
    with postgres_engine.begin() as pg_conn:
        for table_name in tables_order:
            try:
                # Get max ID or 1
                result = pg_conn.execute(text(f"SELECT COALESCE(MAX(id), 1) FROM {table_name};"))
                max_id = result.scalar()
                
                # Reset sequence (PostgreSQL standard auto-increment sequence name is usually table_name_id_seq)
                # We can use pg_get_serial_sequence to get the actual sequence name
                seq_query = f"SELECT pg_get_serial_sequence('{table_name}', 'id');"
                seq_name = pg_conn.execute(text(seq_query)).scalar()
                
                if seq_name:
                    pg_conn.execute(text(f"SELECT setval('{seq_name}', {max_id}, true);"))
                    print(f"Reset sequence '{seq_name}' to {max_id}.")
                else:
                    # Fallback if sequence name could not be resolved automatically
                    seq_name_fallback = f"{table_name}_id_seq"
                    pg_conn.execute(text(f"SELECT setval('{seq_name_fallback}', {max_id}, true);"))
                    print(f"Reset fallback sequence '{seq_name_fallback}' to {max_id}.")
            except Exception as e:
                # Some tables may not have an 'id' column or sequence
                print(f"Skipping sequence reset for '{table_name}': {e}")
                
    print("\n=== Migration Completed Successfully! ===")

if __name__ == "__main__":
    migrate()
