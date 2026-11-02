"""
Database Schema Auditing & Length Analyzer Tool
Audits table string columns, checks maximum & average lengths against declared limits,
and highlights candidates for size optimization.
Supports SQLite and PostgreSQL.
"""

import sys
import os
from pathlib import Path

def audit_sqlite(db_file: str):
    import sqlite3
    print(f"Auditing SQLite Database: {db_file}\n" + "=" * 60)
    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = [r[0] for r in c.fetchall()]

    for t in sorted(tables):
        c.execute(f"PRAGMA table_info({t});")
        cols = c.fetchall()
        c.execute(f"SELECT COUNT(*) FROM {t}")
        row_count = c.fetchone()[0]
        print(f"\n[TABLE] {t} (Total Rows: {row_count})")
        print(f"  {'Column':<22} | {'Declared Type':<15} | {'Max Len':<8} | {'Avg Len':<8} | Recommendation")
        print("  " + "-" * 75)
        for col in cols:
            col_id, col_name, col_type, not_null, default_val, pk = col
            if any(k in col_type.upper() for k in ["VARCHAR", "TEXT", "CHAR", "STRING"]) or col_type == "":
                try:
                    c.execute(f"SELECT MAX(LENGTH({col_name})) FROM {t}")
                    max_len = c.fetchone()[0] or 0
                    c.execute(f"SELECT AVG(LENGTH({col_name})) FROM {t} WHERE {col_name} IS NOT NULL")
                    avg_len = c.fetchone()[0] or 0.0

                    rec = "Optimal"
                    if "255" in col_type and max_len < 50:
                        rec = "Candidate to reduce (< 50 used)"
                    elif "50" in col_type and max_len < 15:
                        rec = "Can reduce to VARCHAR(20)"
                    print(f"  {col_name:<22} | {col_type:<15} | {max_len:<8} | {avg_len:<8.1f} | {rec}")
                except Exception as ex:
                    print(f"  {col_name:<22} | {col_type:<15} | Error: {ex}")
    conn.close()

def audit_postgres(pg_url: str):
    import psycopg2
    from psycopg2.extras import RealDictCursor

    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)

    connect_args = {}
    if "localhost" not in pg_url and "127.0.0.1" not in pg_url and "sslmode" not in pg_url:
        connect_args["sslmode"] = "require"

    print(f"Auditing PostgreSQL / Supabase Database\n" + "=" * 60)
    conn = psycopg2.connect(pg_url, **connect_args)
    c = conn.cursor(cursor_factory=RealDictCursor)

    c.execute("""
        SELECT table_name, column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND data_type IN ('character varying', 'text', 'character')
        ORDER BY table_name, column_name;
    """)
    cols = c.fetchall()

    current_table = None
    for row in cols:
        tbl = row["table_name"]
        col = row["column_name"]
        dtype = row["data_type"]
        max_limit = row["character_maximum_length"] or "unlimited"

        if tbl != current_table:
            current_table = tbl
            c.execute(f"SELECT COUNT(*) as cnt FROM {tbl}")
            cnt = c.fetchone()["cnt"]
            print(f"\n[TABLE] {tbl} (Total Rows: {cnt})")
            print(f"  {'Column':<22} | {'Declared Type':<18} | {'Max Len':<8} | Recommendation")
            print("  " + "-" * 65)

        try:
            c.execute(f"SELECT MAX(LENGTH({col})) as max_len FROM {tbl}")
            res = c.fetchone()
            max_len = res["max_len"] if res and res["max_len"] is not None else 0
            rec = "Optimal"
            if max_limit == 255 and max_len < 50:
                rec = "Candidate to reduce (< 50 used)"
            print(f"  {col:<22} | {dtype}({max_limit}){' ' * (14-len(str(max_limit)))} | {max_len:<8} | {rec}")
        except Exception as ex:
            conn.rollback()
            print(f"  {col:<22} | Error: {ex}")

    conn.close()

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else os.getenv("DATABASE_URL")
    if not target or target.endswith(".db"):
        local_db = target or "sem 3 project AI powered quiz generator/server/quiz_generator.db"
        if not os.path.exists(local_db):
            local_db = "server/quiz_generator.db"
        audit_sqlite(local_db)
    else:
        audit_postgres(target)
