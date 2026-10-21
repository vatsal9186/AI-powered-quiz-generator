import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor

import sys
import os
from pathlib import Path

def sync_data(pg_url=None):
    sqlite_db_path = Path(__file__).resolve().parent / "quiz_generator.db"
    conn_sq = sqlite3.connect(str(sqlite_db_path))
    conn_sq.row_factory = sqlite3.Row
    c_sq = conn_sq.cursor()

    if not pg_url:
        pg_url = sys.argv[1] if len(sys.argv) > 1 else os.getenv("DATABASE_URL")

    if pg_url and not pg_url.startswith("sqlite"):
        if pg_url.startswith("postgres://"):
            pg_url = pg_url.replace("postgres://", "postgresql://", 1)
        print(f"Connecting to PostgreSQL using connection string...")
        conn_pg = psycopg2.connect(pg_url)
    else:
        conn_pg = psycopg2.connect(
            dbname="quiz_generator",
            user="postgres",
            password="1234",
            host="127.0.0.1",
            port="5432"
        )
    c_pg = conn_pg.cursor(cursor_factory=RealDictCursor)

    print("--- 1. Syncing Users ---")
    c_sq.execute("SELECT * FROM users")
    sq_users = c_sq.fetchall()
    user_map = {} # sq_id -> pg_id

    for u in sq_users:
        c_pg.execute("SELECT id FROM users WHERE email = %s", (u["email"],))
        existing = c_pg.fetchone()
        if existing:
            user_map[u["id"]] = existing["id"]
        else:
            c_pg.execute("""
                INSERT INTO users (email, hashed_password, full_name, google_id, profile_picture, auth_provider, role, status, phone_number, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                u["email"], u["hashed_password"], u["full_name"], u["google_id"],
                u["profile_picture"], u["auth_provider"], u["role"], u["status"],
                u["phone_number"], u["created_at"], u["updated_at"]
            ))
            new_id = c_pg.fetchone()["id"]
            user_map[u["id"]] = new_id
            print(f"  Inserted user {u['email']} -> PG ID {new_id}")
    conn_pg.commit()

    print("--- 2. Syncing Documents ---")
    c_sq.execute("SELECT * FROM documents")
    sq_docs = c_sq.fetchall()
    doc_map = {} # sq_id -> pg_id

    for d in sq_docs:
        owner_id = user_map.get(d["owner_id"])
        c_pg.execute("SELECT id FROM documents WHERE title = %s AND owner_id = %s", (d["title"], owner_id))
        existing = c_pg.fetchone()
        if existing:
            doc_map[d["id"]] = existing["id"]
        else:
            c_pg.execute("""
                INSERT INTO documents (title, file_name, content, owner_id, status, error_message, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                d["title"], d["file_name"], d["content"], owner_id,
                d["status"], d["error_message"], d["created_at"], d["updated_at"]
            ))
            new_id = c_pg.fetchone()["id"]
            doc_map[d["id"]] = new_id
            print(f"  Inserted document {d['title']} -> PG ID {new_id}")
    conn_pg.commit()

    print("--- 3. Syncing Modules & Chapters ---")
    c_sq.execute("SELECT * FROM modules")
    sq_mods = c_sq.fetchall()
    mod_map = {}
    for m in sq_mods:
        doc_id = doc_map.get(m["document_id"])
        c_pg.execute("SELECT id FROM modules WHERE document_id = %s AND title = %s", (doc_id, m["title"]))
        existing = c_pg.fetchone()
        if existing:
            mod_map[m["id"]] = existing["id"]
        else:
            c_pg.execute("""
                INSERT INTO modules (document_id, title, "order")
                VALUES (%s, %s, %s)
                RETURNING id
            """, (doc_id, m["title"], m["order"]))
            new_id = c_pg.fetchone()["id"]
            mod_map[m["id"]] = new_id

    c_sq.execute("SELECT * FROM chapters")
    sq_chaps = c_sq.fetchall()
    chap_map = {}
    for ch in sq_chaps:
        doc_id = doc_map.get(ch["document_id"])
        mod_id = mod_map.get(ch["module_id"])
        c_pg.execute("SELECT id FROM chapters WHERE document_id = %s AND title = %s", (doc_id, ch["title"]))
        existing = c_pg.fetchone()
        if existing:
            chap_map[ch["id"]] = existing["id"]
        else:
            c_pg.execute("""
                INSERT INTO chapters (document_id, module_id, title, content, "order")
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (doc_id, mod_id, ch["title"], ch["content"], ch["order"]))
            new_id = c_pg.fetchone()["id"]
            chap_map[ch["id"]] = new_id
    conn_pg.commit()

    print("--- 4. Syncing Topics ---")
    c_sq.execute("SELECT * FROM topics")
    sq_topics = c_sq.fetchall()
    for tp in sq_topics:
        chap_id = chap_map.get(tp["chapter_id"])
        if not chap_id:
            continue
        c_pg.execute("SELECT id FROM topics WHERE chapter_id = %s AND title = %s", (chap_id, tp["title"]))
        if not c_pg.fetchone():
            c_pg.execute("""
                INSERT INTO topics (chapter_id, title, "order")
                VALUES (%s, %s, %s)
            """, (chap_id, tp["title"], tp["order"]))
    conn_pg.commit()

    print("--- 5. Syncing Quizzes ---")
    c_sq.execute("SELECT * FROM quizzes")
    sq_quizzes = c_sq.fetchall()
    quiz_map = {}
    for q in sq_quizzes:
        creator_id = user_map.get(q["creator_id"])
        doc_id = doc_map.get(q["document_id"])
        c_pg.execute("SELECT id FROM quizzes WHERE title = %s AND creator_id IS NOT DISTINCT FROM %s", (q["title"], creator_id))
        existing = c_pg.fetchone()
        if existing:
            quiz_map[q["id"]] = existing["id"]
        else:
            c_pg.execute("""
                INSERT INTO quizzes (title, description, source_type, difficulty, creator_id, document_id, status, error_message, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                q["title"], q["description"], q["source_type"], q["difficulty"],
                creator_id, doc_id, q["status"], q["error_message"],
                q["created_at"], q["updated_at"]
            ))
            new_id = c_pg.fetchone()["id"]
            quiz_map[q["id"]] = new_id
            print(f"  Inserted quiz '{q['title']}' -> PG ID {new_id}")
    conn_pg.commit()

    print("--- 6. Syncing Questions & Options ---")
    c_sq.execute("SELECT * FROM questions")
    sq_questions = c_sq.fetchall()
    question_map = {}
    for qn in sq_questions:
        pg_quiz_id = quiz_map.get(qn["quiz_id"])
        if not pg_quiz_id:
            continue
        c_pg.execute("SELECT id FROM questions WHERE quiz_id = %s AND question_text = %s", (pg_quiz_id, qn["question_text"]))
        existing = c_pg.fetchone()
        if existing:
            question_map[qn["id"]] = existing["id"]
        else:
            c_pg.execute("""
                INSERT INTO questions (quiz_id, question_text, type, explanation, points, source_chapter, difficulty, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                pg_quiz_id, qn["question_text"], qn["type"], qn["explanation"],
                qn["points"], qn["source_chapter"], qn["difficulty"], qn["created_at"]
            ))
            new_id = c_pg.fetchone()["id"]
            question_map[qn["id"]] = new_id

    # Options
    c_sq.execute("SELECT * FROM options")
    sq_options = c_sq.fetchall()
    opt_map = {}
    for opt in sq_options:
        pg_qn_id = question_map.get(opt["question_id"])
        if not pg_qn_id:
            continue
        c_pg.execute("SELECT id FROM options WHERE question_id = %s AND option_text = %s", (pg_qn_id, opt["option_text"]))
        existing = c_pg.fetchone()
        if existing:
            opt_map[opt["id"]] = existing["id"]
        else:
            c_pg.execute("""
                INSERT INTO options (question_id, option_text, is_correct)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (pg_qn_id, opt["option_text"], bool(opt["is_correct"])))
            new_id = c_pg.fetchone()["id"]
            opt_map[opt["id"]] = new_id
    conn_pg.commit()

    print("--- 7. Syncing Attempts & Answers ---")
    c_sq.execute("SELECT * FROM quiz_attempts")
    sq_attempts = c_sq.fetchall()
    attempt_map = {}
    for att in sq_attempts:
        pg_user_id = user_map.get(att["user_id"])
        pg_quiz_id = quiz_map.get(att["quiz_id"])
        if not pg_user_id or not pg_quiz_id:
            continue
        c_pg.execute("SELECT id FROM quiz_attempts WHERE user_id = %s AND quiz_id = %s AND time_spent = %s", (pg_user_id, pg_quiz_id, att["time_spent"]))
        existing = c_pg.fetchone()
        if existing:
            attempt_map[att["id"]] = existing["id"]
        else:
            c_pg.execute("""
                INSERT INTO quiz_attempts (user_id, quiz_id, score, time_spent, completed_at)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (pg_user_id, pg_quiz_id, att["score"], att["time_spent"], att["completed_at"]))
            new_id = c_pg.fetchone()["id"]
            attempt_map[att["id"]] = new_id

    c_sq.execute("SELECT * FROM user_answers")
    sq_answers = c_sq.fetchall()
    for ans in sq_answers:
        pg_att_id = attempt_map.get(ans["attempt_id"])
        pg_qn_id = question_map.get(ans["question_id"])
        pg_opt_id = opt_map.get(ans["selected_option_id"])
        if not pg_att_id or not pg_qn_id:
            continue
        c_pg.execute("SELECT id FROM user_answers WHERE attempt_id = %s AND question_id = %s", (pg_att_id, pg_qn_id))
        if not c_pg.fetchone():
            c_pg.execute("""
                INSERT INTO user_answers (attempt_id, question_id, selected_option_id, text_answer, is_correct)
                VALUES (%s, %s, %s, %s, %s)
            """, (pg_att_id, pg_qn_id, pg_opt_id, ans["text_answer"], bool(ans["is_correct"])))
    conn_pg.commit()

    print("--- 8. Syncing Password Reset OTPs ---")
    c_sq.execute("SELECT * FROM password_reset_otps")
    sq_otps = c_sq.fetchall()
    for otp in sq_otps:
        pg_user_id = user_map.get(otp["user_id"]) if otp["user_id"] else None
        c_pg.execute("SELECT id FROM password_reset_otps WHERE reference_id = %s", (otp["reference_id"],))
        if not c_pg.fetchone():
            c_pg.execute("""
                INSERT INTO password_reset_otps (user_id, verification_method, phone_number, email, reference_id, otp_hash, expires_at, attempt_count, max_attempts, is_used, resend_available_at, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                pg_user_id, otp["verification_method"], otp["phone_number"], otp["email"],
                otp["reference_id"], otp["otp_hash"], otp["expires_at"], otp["attempt_count"],
                otp["max_attempts"], bool(otp["is_used"]), otp["resend_available_at"], otp["created_at"]
            ))
    conn_pg.commit()

    print("--- 9. Updating PostgreSQL Auto-Increment Sequences ---")
    tables_with_id = ['users', 'documents', 'modules', 'chapters', 'topics', 'quizzes', 'questions', 'options', 'quiz_attempts', 'user_answers', 'password_reset_otps']
    for tbl in tables_with_id:
        c_pg.execute(f"SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM {tbl}")
        next_id = c_pg.fetchone()["next_id"]
        c_pg.execute(f"SELECT pg_get_serial_sequence('{tbl}', 'id') as seq")
        seq_res = c_pg.fetchone()
        if seq_res and seq_res["seq"]:
            seq_name = seq_res["seq"]
            c_pg.execute(f"SELECT setval('{seq_name}', {next_id}, false)")
            print(f"  Sequence {seq_name} reset to {next_id}")
    conn_pg.commit()

    print("\n[SUCCESS] Sync complete! All SQLite data has been unified into PostgreSQL!")

if __name__ == "__main__":
    sync_data()
