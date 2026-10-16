import sqlite3

def check_sqlite():
    conn = sqlite3.connect("quiz_generator.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name FROM users")
    rows = cursor.fetchall()
    print("All SQLite users:")
    for row in rows:
        print(row)
    conn.close()

if __name__ == "__main__":
    check_sqlite()
