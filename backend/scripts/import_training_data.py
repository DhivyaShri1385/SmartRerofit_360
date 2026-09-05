"""
Run once (or whenever you need to reload the CSV) to import the
reference dataset into ml_training_records:

    python scripts/import_training_data.py predictive_maintenance_v3.csv
"""
import sys
import os

# Make the `app` package importable when running this script directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.analytics.importer import import_csv

# Ensure all tables (including ml_training_records) exist before importing
import app.models  # noqa: F401  — triggers model registration with Base

Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_training_data.py <path_to_csv>")
        sys.exit(1)

    csv_path = sys.argv[1]
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        sys.exit(1)

    db = SessionLocal()
    try:
        count = import_csv(db, csv_path, dataset_version="predictive_maintenance_v3")
        print(f"Imported {count} rows (dataset_version=predictive_maintenance_v3)")
    finally:
        db.close()