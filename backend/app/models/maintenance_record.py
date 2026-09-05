"""
Maintenance records — both manually logged events and records created
from a Predictive Maintenance recommendation (source="predictive_suggested").
Clearly distinguished so simulated recommendations are never confused
with actual maintenance history in reports.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class MaintenanceType(str, enum.Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    INSPECTION = "inspection"
    CONDITION_BASED = "condition_based"


class MaintenanceRecordStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"  # derived at read time, not stored directly as final state


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False)

    maintenance_type = Column(Enum(MaintenanceType), nullable=False)
    description = Column(Text, nullable=False)
    performed_by = Column(String, nullable=True)
    parts_used = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    scheduled_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)

    source = Column(String, default="manual")  # "manual" | "predictive_suggested"
    is_demo = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    machine = relationship("Machine", backref="maintenance_records")