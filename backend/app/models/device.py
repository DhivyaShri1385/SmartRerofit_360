"""
IoT device records — one per machine's planned ESP32 controller.
No physical device is connected in this phase; every seeded device
starts in NOT_REGISTERED state. This table exists purely to prepare
the software/API surface for Step 17 (MQTT-ready architecture).
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class DeviceConnectionStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    CONNECTING = "connecting"
    NOT_REGISTERED = "not_registered"


class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=generate_uuid)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False)

    device_name = Column(String, nullable=False)         # e.g. "ESP32-LATHE-01"
    device_type = Column(String, default="ESP32")
    firmware_version = Column(String, nullable=True)      # planned version, not deployed
    protocol = Column(String, default="MQTT (planned)")
    mqtt_topic = Column(String, nullable=True)             # reserved topic pattern for Step 17

    connection_status = Column(Enum(DeviceConnectionStatus), default=DeviceConnectionStatus.NOT_REGISTERED)
    last_seen = Column(DateTime, nullable=True)
    last_message = Column(String, nullable=True)

    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    machine = relationship("Machine", backref="devices")