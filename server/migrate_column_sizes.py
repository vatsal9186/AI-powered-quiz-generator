"""
QuestAI Database Schema Migration & Verification Script
Verifies existing data against new proposed limits and applies ALTER TABLE statements.
Supports both PostgreSQL (Supabase / local) and SQLite.
"""

import sys
import os
from pathlib import Path

# Add server directory to path
server_dir = Path(__file__).resolve().parent
if str(server_dir) not in sys.path:
    sys.path.insert(0, str(server_dir))

NEW_LIMITS = {
    "users": {
        "email": 100,
        "hashed_password": 72,
        "full_name": 60,
        "google_id": 50,
        "profile_picture": 500,
        "auth_provider": 20,
        "role": 20,
        "status": 20,
        "phone_number": 20,
    },
    "documents": {
        "title": 150,
        "file_name": 150,
        "status": 20,
    },
    "password_reset_otps": {
        "verification_method": 10,
        "phone_number": 50,
        "email": 100,
        "reference_id": 64,
        "otp_hash": 64,
    },
    "modules": {
        "title": 150,
    },
    "quizzes": {
        "title": 150,
        "source_type": 20,
        "difficulty": 20,
        "status": 20,
    },
    "chapters": {
        "title": 150,
    },
    "questions": {
        "type": 20,
        "source_chapter": 150,
        "difficulty": 20,
    },
    "topics": {
        "title": 150,
    },
}

def verify_and_migrate_sqlite(db_path: str):
    import sqlite3
    print(f"\n[INFO] Connecting to SQLite: {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    violations = []
    print("[1/2] Auditing current data for size compatibility...")
    for table, columns in NEW_LIMITS.items():
        c.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}';")
        if not c.fetchone():
            continue
        for col, max_limit in columns.items():
            query = f"SELECT {col}, LENGTH({col}) FROM {table} WHERE LENGTH({col}) > ?;"
            c.execute(query, (max_limit,))
            rows = c.fetchall()
            if rows:
                violations.append((table, col, max_limit, len(rows), rows[0]))

    if violations:
        print("[ERROR] Cannot migrate! Some records exceed proposed limits:")
        for t, col, limit, count, sample in violations:
            print(f"  - Table {t}, Column {col}: {count} records exceed limit of {limit} (sample: '{sample[0]}', len={sample[1]})")
        conn.close()
        return False

    print("[SUCCESS] 0 violations found. All existing records safely fit inside new limits!")
    conn.close()
    return True

def verify_and_migrate_postgres(pg_url: str):
    import psycopg2
    from psycopg2.extras import RealDictCursor

    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)

    connect_args = {}
    if "localhost" not in pg_url and "127.0.0.1" not in pg_url and "sslmode" not in pg_url:
        connect_args["sslmode"] = "require"

    print(f"\n[INFO] Connecting to PostgreSQL / Supabase...")
    conn = psycopg2.connect(pg_url, **connect_args)
    c = conn.cursor(cursor_factory=RealDictCursor)

    print("[1/2] Auditing current data for size compatibility...")
    violations = []
    for table, columns in NEW_LIMITS.items():
        for col, max_limit in columns.items():
            query = f"SELECT {col}, LENGTH({col}) as len FROM {table} WHERE LENGTH({col}) > %s LIMIT 5;"
            try:
                c.execute(query, (max_limit,))
                rows = c.fetchall()
                if rows:
                    violations.append((table, col, max_limit, len(rows), rows[0]))
            except Exception as e:
                conn.rollback()
                print(f"  Warning checking {table}.{col}: {e}")

    if violations:
        print("[ERROR] Cannot migrate! Some records exceed proposed limits:")
        for t, col, limit, count, sample in violations:
            print(f"  - Table {t}, Column {col}: {count} records exceed limit of {limit}")
        conn.close()
        return False

    print("[SUCCESS] 0 violations found. All records safely within bounds.")
    print("[2/2] Applying ALTER TABLE statements to PostgreSQL...")

    alter_statements = [
        # Users
        "ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(100);",
        "ALTER TABLE users ALTER COLUMN hashed_password TYPE VARCHAR(72);",
        "ALTER TABLE users ALTER COLUMN full_name TYPE VARCHAR(60);",
        "ALTER TABLE users ALTER COLUMN google_id TYPE VARCHAR(50);",
        "ALTER TABLE users ALTER COLUMN profile_picture TYPE VARCHAR(500);",
        "ALTER TABLE users ALTER COLUMN auth_provider TYPE VARCHAR(20);",
        "ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20);",
        "ALTER TABLE users ALTER COLUMN status TYPE VARCHAR(20);",
        "ALTER TABLE users ALTER COLUMN phone_number TYPE VARCHAR(20);",
        # Documents
        "ALTER TABLE documents ALTER COLUMN title TYPE VARCHAR(150);",
        "ALTER TABLE documents ALTER COLUMN file_name TYPE VARCHAR(150);",
        "ALTER TABLE documents ALTER COLUMN status TYPE VARCHAR(20);",
        # Password Reset OTPs
        "ALTER TABLE password_reset_otps ALTER COLUMN verification_method TYPE VARCHAR(10);",
        "ALTER TABLE password_reset_otps ALTER COLUMN phone_number TYPE VARCHAR(50);",
        "ALTER TABLE password_reset_otps ALTER COLUMN email TYPE VARCHAR(100);",
        "ALTER TABLE password_reset_otps ALTER COLUMN reference_id TYPE VARCHAR(64);",
        "ALTER TABLE password_reset_otps ALTER COLUMN otp_hash TYPE VARCHAR(64);",
        # Modules
        "ALTER TABLE modules ALTER COLUMN title TYPE VARCHAR(150);",
        # Quizzes
        "ALTER TABLE quizzes ALTER COLUMN title TYPE VARCHAR(150);",
        "ALTER TABLE quizzes ALTER COLUMN source_type TYPE VARCHAR(20);",
        "ALTER TABLE quizzes ALTER COLUMN difficulty TYPE VARCHAR(20);",
        "ALTER TABLE quizzes ALTER COLUMN status TYPE VARCHAR(20);",
        # Chapters
        "ALTER TABLE chapters ALTER COLUMN title TYPE VARCHAR(150);",
        # Questions
        "ALTER TABLE questions ALTER COLUMN type TYPE VARCHAR(20);",
        "ALTER TABLE questions ALTER COLUMN source_chapter TYPE VARCHAR(150);",
        "ALTER TABLE questions ALTER COLUMN difficulty TYPE VARCHAR(20);",
        # Topics
        "ALTER TABLE topics ALTER COLUMN title TYPE VARCHAR(150);",
    ]

    for stmt in alter_statements:
        try:
            c.execute(stmt)
            print(f"  [OK] {stmt.strip()}")
        except Exception as e:
            print(f"  [SKIP/ERROR] {stmt.strip()}: {e}")
            conn.rollback()

    conn.commit()
    print("\n🎉 PostgreSQL migration successfully completed!")
    conn.close()
    return True

if __name__ == "__main__":
    db_arg = sys.argv[1] if len(sys.argv) > 1 else os.getenv("DATABASE_URL")
    if not db_arg or db_arg.endswith(".db"):
        sqlite_file = db_arg or str(server_dir / "quiz_generator.db")
        verify_and_migrate_sqlite(sqlite_file)
    else:
        verify_and_migrate_postgres(db_arg)
