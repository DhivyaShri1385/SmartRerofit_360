from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.sensor import SensorType, SensorState


class SensorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    machine_id: str
    sensor_type: SensorType
    unit: str
    state: SensorState
    sampling_enabled: bool
    last_update: Optional[datetime]
    warning_min: Optional[float]
    warning_max: Optional[float]
    critical_min: Optional[float]
    critical_max: Optional[float]
    is_demo: bool
    updated_at: datetime


class ThresholdUpdate(BaseModel):
    warning_min: Optional[float] = None
    warning_max: Optional[float] = None
    critical_min: Optional[float] = None
    critical_max: Optional[float] = None


class SensorStateUpdate(BaseModel):
    sampling_enabled: bool