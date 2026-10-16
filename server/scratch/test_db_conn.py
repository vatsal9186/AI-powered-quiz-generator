import sys
import os
import time
from sqlalchemy import create_engine

# Add server root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

def test():
    print(f"Attempting to connect to: {settings.DATABASE_URL} ...")
    start = time.time()
    try:
        engine = create_engine(settings.DATABASE_URL, connect_args={"connect_timeout": 5})
        with engine.connect() as conn:
            elapsed = time.time() - start
            print(f"[OK] Connected successfully to PostgreSQL database in {elapsed:.3f} seconds!")
            return True
    except Exception as e:
        elapsed = time.time() - start
        print(f"[FAIL] Connection failed after {elapsed:.3f} seconds: {e}")
        return False

if __name__ == "__main__":
    test()
