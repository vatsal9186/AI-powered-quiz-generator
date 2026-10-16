import psycopg2
conn = psycopg2.connect('postgresql://postgres:1234@localhost:5432/quiz_generator')
cur = conn.cursor()

# Get documents
cur.execute("SELECT id, title, status, error_message FROM documents ORDER BY id DESC LIMIT 5")
print("Latest Documents:")
for row in cur.fetchall():
    print(row)

# Get modules for the latest document
cur.execute("SELECT id, document_id, title FROM modules ORDER BY id DESC LIMIT 10")
print("\nLatest Modules:")
for row in cur.fetchall():
    print(row)

# Get chapters
cur.execute("SELECT id, module_id, title FROM chapters ORDER BY id DESC LIMIT 10")
print("\nLatest Chapters:")
for row in cur.fetchall():
    print(row)

conn.close()
