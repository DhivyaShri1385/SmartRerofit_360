"""
Time-series sensor values. Every row is explicitly tagged with its
origin via data_source. Right now only "simulated" is ever written —
"hardware" is reserved for when ESP32/MQTT ingestion lands.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(String, primary_key=True, default=generate_uuid)
    sensor_id = Column(String, ForeignKey("sensors.id"), nullable=False)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False)
    value = Column(Float, nullable=False)
    data_source = Column(String, nullable=False, default="simulated")  # "simulated" | "hardware"
    recorded_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_sensor_readings_sensor_time", "sensor_id", "recorded_at"),
    )