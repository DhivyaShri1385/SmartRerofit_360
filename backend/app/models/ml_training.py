"""
Stores rows from external/synthetic reference datasets used to
prototype the predictive-maintenance ML pipeline.

IMPORTANT: This table is intentionally isolated from `sensor_readings`.
Live/simulated machine data must never be mixed with this table, so
swapping in real ESP32 hardware data later can't accidentally pick up
rows from a synthetic reference dataset.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class MLTrainingRecord(Base):
    __tablename__ = "ml_training_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_version = Column(String, nullable=False, index=True)  # e.g. "predictive_maintenance_v3"

    timestamp = Column(DateTime, nullable=False)
    source_machine_id = Column(String, nullable=False)   # ID from the CSV — unrelated to Machine.id
    machine_type = Column(String, nullable=False)

    vibration_rms = Column(Float, nullable=True)
    temperature_motor = Column(Float, nullable=True)
    current_phase_avg = Column(Float, nullable=True)
    pressure_level = Column(Float, nullable=True)
    rpm = Column(Float, nullable=True)
    operating_mode = Column(String, nullable=True)
    hours_since_maintenance = Column(Float, nullable=True)
    ambient_temp = Column(Float, nullable=True)

    rul_hours = Column(Float, nullable=True)
    failure_within_24h = Column(Integer, nullable=False, default=0)
    failure_type = Column(String, nullable=True)
    estimated_repair_cost = Column(Float, nullable=True)