from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.machine import MachineStatus, ConnectivityStatus, MaintenanceStatus


class MachineBase(BaseModel):
    name: str
    machine_type: str
    location: Optional[str] = None


class MachineCreate(MachineBase):
    sensor_count: int = 0


class MachineUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[MachineStatus] = None
    connectivity: Optional[ConnectivityStatus] = None
    maintenance_status: Optional[MaintenanceStatus] = None
    monitoring_enabled: Optional[bool] = None
    is_active: Optional[bool] = None
    sensor_count: Optional[int] = None


class MachineOut(MachineBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    status: MachineStatus
    connectivity: ConnectivityStatus
    maintenance_status: MaintenanceStatus
    installed_on: datetime
    sensor_count: int
    last_communication: Optional[datetime]
    monitoring_enabled: bool
    is_active: bool
    is_demo: bool
    updated_at: datetime