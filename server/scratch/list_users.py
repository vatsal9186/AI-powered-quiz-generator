import sys
import os
from sqlalchemy import create_engine, MetaData, Table

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
meta = MetaData()
users_table = Table("users", meta, autoload_with=engine)

with engine.connect() as conn:
    res = conn.execute(users_table.select())
    for r in res.fetchall():
        print(dict(r._mapping))
