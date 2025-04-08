from sqlalchemy import create_engine
from models import db  # This gives you access to db.metadata
from eralchemy.main import render_er

# PostgreSQL URI (adjust as needed)
DATABASE_URI = 'postgresql://postgres:postgres@localhost:5432/asc_db'

# Set up the engine
engine = create_engine(DATABASE_URI)

# Create all tables from your Flask SQLAlchemy models
db.metadata.create_all(engine)

# Generate ER diagram
render_er(DATABASE_URI, 'er_diagram.pdf')

print("✅ ER diagram generated as er_diagram.pdf")
