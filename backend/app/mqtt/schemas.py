"""
Expected JSON message body for a single sensor reading published by an
ESP32 device.

Example payload:
{
  "device_id": "ESP32-LATHE-01",
  "machine_id": "8f3c1e2a-...",
  "sensor": "vibration",
  "value": 2.34,
  "unit": "mm/s",
  "timestamp": "2026-09-05T10:15:30Z"
}
"""
from datetime import datetime
from pydantic import BaseModel, field_validator


class MQTTSensorMessage(BaseModel):
    device_id: str
    machine_id: str
    sensor: str
    value: float
    unit: str
    timestamp: datetime

    @field_validator("sensor")
    @classmethod
    def sensor_must_be_known(cls, v: str) -> str:
        allowed = {"vibration", "temperature", "current", "voltage", "rpm"}
        if v not in allowed:
            raise ValueError(f"Unknown sensor type '{v}'. Must be one of {allowed}")
        return v