"""
Alerts raised from sensor threshold crossings (rule-based, Step 9).
Kept generic enough that future ML-driven anomaly alerts (Predictive
Maintenance module) can write into this same table without schema changes —
just a different `source` value.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class AlertLevel(str, enum.Enum):
    INFORMATION = "information"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False)
    sensor_id = Column(String, ForeignKey("sensors.id"), nullable=True)

    level = Column(Enum(AlertLevel), nullable=False)
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE)
    parameter = Column(String, nullable=True)
    message = Column(String, nullable=False)
    value_at_trigger = Column(Float, nullable=True)

    source = Column(String, default="rule_based")  # rule_based | ml_anomaly (future)
    data_source = Column(String, default="simulated")  # simulated | hardware

    created_at = Column(DateTime, default=datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    auto_resolved = Column(String, nullable=True)  # "true" if resolved by recovery, not a person

    machine = relationship("Machine", backref="alerts")