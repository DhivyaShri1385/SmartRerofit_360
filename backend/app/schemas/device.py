from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.device import DeviceConnectionStatus


class DeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    machine_id: str
    device_name: str
    device_type: str
    firmware_version: Optional[str]
    protocol: str
    mqtt_topic: Optional[str]
    connection_status: DeviceConnectionStatus
    last_seen: Optional[datetime]
    last_message: Optional[str]
    is_demo: bool
    created_at: datetime


class DeviceUpdate(BaseModel):
    firmware_version: Optional[str] = None
    mqtt_topic: Optional[str] = None


class SensorMappingOut(BaseModel):
    sensor_id: str
    parameter: str
    unit: str
    state: str