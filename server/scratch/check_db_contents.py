import sys
import os
from sqlalchemy import create_engine, MetaData, Table, inspect

# Add server root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

def inspect_all_tables(db_url, name):
    print(f"\n=== Inspecting {name} Database ===")
    try:
        engine = create_engine(db_url)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        for table_name in tables:
            try:
                with engine.connect() as conn:
                    # count rows
                    meta = MetaData()
                    table = Table(table_name, meta, autoload_with=engine)
                    res = conn.execute(table.select())
                    rows = res.fetchall()
                    print(f"Table '{table_name}': {len(rows)} rows")
            except Exception as e:
                print(f"Error querying table '{table_name}': {e}")
    except Exception as e:
        print(f"Error inspecting {name} database: {e}")

if __name__ == "__main__":
    inspect_all_tables(settings.DATABASE_URL, "Configured DB (.env)")
    inspect_all_tables("sqlite:///./quiz_generator.db", "Local SQLite file")
