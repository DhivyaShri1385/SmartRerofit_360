from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.maintenance_record import MaintenanceType


class MaintenanceRecordCreate(BaseModel):
    machine_id: str
    maintenance_type: MaintenanceType
    description: str
    performed_by: Optional[str] = None
    parts_used: Optional[str] = None
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    source: str = "manual"


class MaintenanceRecordUpdate(BaseModel):
    maintenance_type: Optional[MaintenanceType] = None
    description: Optional[str] = None
    performed_by: Optional[str] = None
    parts_used: Optional[str] = None
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    is_completed: Optional[bool] = None


class MaintenanceRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    machine_id: str
    maintenance_type: MaintenanceType
    description: str
    performed_by: Optional[str]
    parts_used: Optional[str]
    notes: Optional[str]
    scheduled_date: Optional[datetime]
    completed_date: Optional[datetime]
    is_completed: bool
    status: str  # computed: scheduled | in_progress | completed | overdue
    source: str
    is_demo: bool
    created_at: datetime


class MaintenanceOverview(BaseModel):
    upcoming_count: int
    overdue_count: int
    completed_this_month: int
    recent: list[MaintenanceRecordOut]