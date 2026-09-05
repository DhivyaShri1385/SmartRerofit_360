from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class LiveSensorPoint(BaseModel):
    sensor_id: str
    parameter: str
    unit: str
    state: str
    value: Optional[float]
    last_update: Optional[datetime]
    is_stale: bool


class LiveHistoryPoint(BaseModel):
    timestamp: datetime
    vibration: Optional[float] = None
    temperature: Optional[float] = None
    current: Optional[float] = None
    voltage: Optional[float] = None
    rpm: Optional[float] = None


class LiveMonitoringSnapshot(BaseModel):
    machine_id: str
    machine_name: str
    status: str
    connectivity: str
    monitoring_enabled: bool
    data_source: str = "simulated"
    server_time: datetime
    sensors: List[LiveSensorPoint]
    history: List[LiveHistoryPoint]