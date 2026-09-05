from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.alert import AlertLevel, AlertStatus


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    machine_id: str
    sensor_id: Optional[str]
    level: AlertLevel
    status: AlertStatus
    parameter: Optional[str]
    message: str
    value_at_trigger: Optional[float]
    source: str
    data_source: str
    created_at: datetime
    acknowledged_at: Optional[datetime]
    acknowledged_by: Optional[str]
    resolved_at: Optional[datetime]


class AlertSummary(BaseModel):
    information: int
    warning: int
    critical: int
    total_active: int