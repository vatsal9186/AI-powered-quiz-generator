import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def init_postgres():
    # Connect to default postgres DB
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='1234',
        host='127.0.0.1',
        port='5432'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Check if quiz_generator database exists
    cur.execute("SELECT 1 FROM pg_database WHERE datname='quiz_generator';")
    exists = cur.fetchone()
    
    if not exists:
        print("Creating database 'quiz_generator'...")
        cur.execute("CREATE DATABASE quiz_generator;")
    else:
        print("Database 'quiz_generator' already exists.")
        
    cur.close()
    conn.close()

if __name__ == "__main__":
    init_postgres()
    print("PostgreSQL database setup completed successfully!")
