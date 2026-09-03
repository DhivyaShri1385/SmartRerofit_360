"""
Loads the external reference dataset CSV into ml_training_records.
Safe to re-run — clears existing rows for the same dataset_version first.
"""
import pandas as pd
from sqlalchemy.orm import Session
from app.models.ml_training import MLTrainingRecord

REQUIRED_COLUMNS = [
    "timestamp", "machine_id", "machine_type", "vibration_rms",
    "temperature_motor", "current_phase_avg", "pressure_level", "rpm",
    "operating_mode", "hours_since_maintenance", "ambient_temp",
    "rul_hours", "failure_within_24h", "failure_type", "estimated_repair_cost",
]


def import_csv(db: Session, csv_path: str, dataset_version: str) -> int:
    df = pd.read_csv(csv_path)
    missing = set(REQUIRED_COLUMNS) - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")

    db.query(MLTrainingRecord).filter(
        MLTrainingRecord.dataset_version == dataset_version
    ).delete()

    df["timestamp"] = pd.to_datetime(df["timestamp"])

    records = [
        MLTrainingRecord(
            dataset_version=dataset_version,
            timestamp=row.timestamp.to_pydatetime(),
            source_machine_id=str(row.machine_id),
            machine_type=row.machine_type,
            vibration_rms=None if pd.isna(row.vibration_rms) else row.vibration_rms,
            temperature_motor=None if pd.isna(row.temperature_motor) else row.temperature_motor,
            current_phase_avg=None if pd.isna(row.current_phase_avg) else row.current_phase_avg,
            pressure_level=None if pd.isna(row.pressure_level) else row.pressure_level,
            rpm=None if pd.isna(row.rpm) else row.rpm,
            operating_mode=row.operating_mode,
            hours_since_maintenance=row.hours_since_maintenance,
            ambient_temp=row.ambient_temp,
            rul_hours=None if pd.isna(row.rul_hours) else row.rul_hours,
            failure_within_24h=int(row.failure_within_24h),
            failure_type=row.failure_type,
            estimated_repair_cost=row.estimated_repair_cost,
        )
        for row in df.itertuples(index=False)
    ]

    db.bulk_save_objects(records)
    db.commit()
    return len(records)