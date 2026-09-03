"""
Run once to load the reference dataset CSV into the database:
    python scripts/import_training_data.py predictive_maintenance_v3.csv
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.analytics.importer import import_csv

Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_training_data.py <path_to_csv>")
        sys.exit(1)

    db = SessionLocal()
    try:
        count = import_csv(db, sys.argv[1], dataset_version="predictive_maintenance_v3")
        print(f"Imported {count} rows (dataset_version=predictive_maintenance_v3)")
    finally:
        db.close()