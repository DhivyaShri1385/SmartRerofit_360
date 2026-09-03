"""
Core Machine entity. Seeded demo machines (Lathe-01, Drilling-01,
Milling-01) are configuration/demo data, not real installed hardware —
see is_demo flag, always surfaced in the UI.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, Boolean, Integer
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class MachineStatus(str, enum.Enum):
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"


class ConnectivityStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"


class MaintenanceStatus(str, enum.Enum):
    UP_TO_DATE = "up_to_date"
    DUE_SOON = "due_soon"
    OVERDUE = "overdue"


class Machine(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)          # e.g. "Lathe-01"
    machine_type = Column(String, nullable=False)                # e.g. "Lathe"
    location = Column(String, nullable=True)

    status = Column(Enum(MachineStatus), default=MachineStatus.OFFLINE)
    connectivity = Column(Enum(ConnectivityStatus), default=ConnectivityStatus.OFFLINE)
    maintenance_status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.UP_TO_DATE)

    installed_on = Column(DateTime, default=datetime.utcnow)
    sensor_count = Column(Integer, default=0)          # configured count, not live-detected yet
    last_communication = Column(DateTime, nullable=True)

    monitoring_enabled = Column(Boolean, default=True)   # toggle: enable/disable monitoring
    is_active = Column(Boolean, default=True)             # soft-delete flag
    is_demo = Column(Boolean, default=True)               # True until real hardware is provisioned

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)