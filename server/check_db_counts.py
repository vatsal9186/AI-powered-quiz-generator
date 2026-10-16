import sqlite3
import psycopg2

print("=== SQLITE DATA ===")
conn_sq = sqlite3.connect("quiz_generator.db")
c_sq = conn_sq.cursor()
c_sq.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in c_sq.fetchall() if not row[0].startswith("sqlite_")]
for t in sorted(tables):
    c_sq.execute(f"SELECT COUNT(*) FROM {t}")
    print(f"SQLite {t}: {c_sq.fetchone()[0]}")

print("\n=== POSTGRESQL DATA ===")
conn_pg = psycopg2.connect(dbname="quiz_generator", user="postgres", password="1234", host="127.0.0.1", port="5432")
c_pg = conn_pg.cursor()
c_pg.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
pg_tables = [row[0] for row in c_pg.fetchall()]
for t in sorted(pg_tables):
    c_pg.execute(f"SELECT COUNT(*) FROM {t}")
    print(f"Postgres {t}: {c_pg.fetchone()[0]}")
