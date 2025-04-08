import os
import pandas as pd
from sqlalchemy import create_engine, inspect

# Update with your DB credentials
DB_USER = 'chow'
DB_PASS = 'chowchow'
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'asc_db'

# --- Connect to DB ---
DATABASE_URL = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
engine = create_engine(DATABASE_URL)

# --- Folder for Exported CSVs ---
EXPORT_FOLDER = 'tables'
os.makedirs(EXPORT_FOLDER, exist_ok=True)

# --- Get All Non-Sequence Tables ---
inspector = inspect(engine)
table_names = [t for t in inspector.get_table_names() if not t.endswith('_id_seq')]

# --- Export Each Table to CSV ---
for table in table_names:
    df = pd.read_sql_table(table, engine)
    file_path = os.path.join(EXPORT_FOLDER, f'{table}.csv')
    df.to_csv(file_path, index=False)
    print(f'✅ {table} → {file_path}')
