"""
Loads ml_training_records into a DataFrame and prepares features.
Completely separate from the dashboard/live-data path.
"""
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.ml_training import MLTrainingRecord

FEATURE_COLUMNS = [
    "vibration_rms", "temperature_motor", "current_phase_avg",
    "pressure_level", "rpm", "hours_since_maintenance", "ambient_temp",
]
TARGET_COLUMN = "failure_within_24h"


def load_dataframe(db: Session, dataset_version: str) -> pd.DataFrame:
    rows = db.execute(
        select(MLTrainingRecord).where(MLTrainingRecord.dataset_version == dataset_version)
    ).scalars().all()

    if not rows:
        return pd.DataFrame()

    data = [{
        "vibration_rms": r.vibration_rms,
        "temperature_motor": r.temperature_motor,
        "current_phase_avg": r.current_phase_avg,
        "pressure_level": r.pressure_level,
        "rpm": r.rpm,
        "hours_since_maintenance": r.hours_since_maintenance,
        "ambient_temp": r.ambient_temp,
        "failure_within_24h": r.failure_within_24h,
    } for r in rows]

    df = pd.DataFrame(data)
    for col in FEATURE_COLUMNS:
        df[col] = df[col].fillna(df[col].median())  # simple median imputation, documented for the report
    return df