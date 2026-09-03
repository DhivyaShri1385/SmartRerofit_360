"""
Sensor configuration entity — one row per (machine, parameter) pair.
Actual time-series readings live in a separate table (sensor_readings),
introduced in Step 7 (Simulated Data Engine). This table only tracks
sensor metadata, state, and configured thresholds.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class SensorType(str, enum.Enum):
    VIBRATION = "vibration"
    TEMPERATURE = "temperature"
    CURRENT = "current"
    VOLTAGE = "voltage"
    RPM = "rpm"


class SensorState(str, enum.Enum):
    ACTIVE = "active"
    WARNING = "warning"
    FAULT = "fault"
    OFFLINE = "offline"
    NOT_CONFIGURED = "not_configured"


SENSOR_UNITS = {
    SensorType.VIBRATION: "mm/s",
    SensorType.TEMPERATURE: "°C",
    SensorType.CURRENT: "A",
    SensorType.VOLTAGE: "V",
    SensorType.RPM: "RPM",
}


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String, primary_key=True, default=generate_uuid)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False)
    sensor_type = Column(Enum(SensorType), nullable=False)
    unit = Column(String, nullable=False)

    state = Column(Enum(SensorState), default=SensorState.NOT_CONFIGURED)
    sampling_enabled = Column(Boolean, default=False)  # simulation not started until Step 7
    last_update = Column(DateTime, nullable=True)

    # Configurable thresholds — configuration values, not experimentally validated limits
    warning_min = Column(Float, nullable=True)
    warning_max = Column(Float, nullable=True)
    critical_min = Column(Float, nullable=True)
    critical_max = Column(Float, nullable=True)

    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    machine = relationship("Machine", backref="sensors")