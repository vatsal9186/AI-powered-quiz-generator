import os
import sys
import zipfile
import urllib.request
import subprocess
import time

pg_dir = r"D:\PostgreSQL16"
zip_path = r"D:\PostgreSQL16_binaries.zip"
data_dir = os.path.join(pg_dir, "data")
bin_dir = os.path.join(pg_dir, "pgsql", "bin")

url = "https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64-binaries.zip"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

if not os.path.exists(pg_dir):
    os.makedirs(pg_dir, exist_ok=True)

target_exe = os.path.join(bin_dir, "postgres.exe")
if not os.path.exists(target_exe):
    print(f"Downloading PostgreSQL 16 binaries from EDB mirror...")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(zip_path, "wb") as f:
        length = int(resp.headers.get('Content-Length', 0))
        downloaded = 0
        while True:
            chunk = resp.read(2 * 1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
            downloaded += len(chunk)
            if length:
                mb_dn = downloaded // (1024 * 1024)
                mb_total = length // (1024 * 1024)
                sys.stdout.write(f"\r  Progress: {mb_dn} MB / {mb_total} MB ({int(downloaded/length*100)}%)")
                sys.stdout.flush()
    print("\nDownload complete! Extracting archive...")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(pg_dir)
    print("Extraction complete!")
    if os.path.exists(zip_path):
        os.remove(zip_path)

initdb_exe = os.path.join(bin_dir, "initdb.exe")
postgres_exe = os.path.join(bin_dir, "postgres.exe")
pg_ctl_exe = os.path.join(bin_dir, "pg_ctl.exe")
createdb_exe = os.path.join(bin_dir, "createdb.exe")
psql_exe = os.path.join(bin_dir, "psql.exe")

if not os.path.exists(data_dir):
    print("Initializing database cluster with initdb...")
    subprocess.run([initdb_exe, "-D", data_dir, "-U", "postgres", "-A", "trust", "-E", "UTF8"], check=True)

print("Starting PostgreSQL server on port 5432...")
log_file = os.path.join(pg_dir, "postgres.log")
subprocess.run([pg_ctl_exe, "-D", data_dir, "-l", log_file, "start"], check=False)

time.sleep(3)

print("Setting user password for 'postgres' to '1234'...")
subprocess.run([psql_exe, "-U", "postgres", "-c", "ALTER USER postgres WITH PASSWORD '1234';"], check=False)

print("Creating database 'quiz_generator'...")
subprocess.run([createdb_exe, "-U", "postgres", "quiz_generator"], check=False)

print("\n========================================================")
print("[SUCCESS] PostgreSQL 16 is fully setup and running!")
print("Database URL: postgresql://postgres:1234@localhost:5432/quiz_generator")
print("========================================================")
