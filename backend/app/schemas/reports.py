from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class MachinePerformanceReportRow(BaseModel):
    machine_id: str
    machine_name: str
    uptime_pct: float
    avg_health_status: str
    total_alerts: int
    total_maintenance_events: int


class SensorTrendReportRow(BaseModel):
    parameter: str
    avg_value: float
    min_value: float
    max_value: float
    reading_count: int


class AlertReportRow(BaseModel):
    level: str
    count: int


class MaintenanceReportRow(BaseModel):
    maintenance_type: str
    count: int
    completed_count: int


class ReportBundle(BaseModel):
    generated_at: datetime
    date_from: Optional[datetime]
    date_to: Optional[datetime]
    machine_performance: List[MachinePerformanceReportRow]
    sensor_trends: List[SensorTrendReportRow]
    alert_breakdown: List[AlertReportRow]
    maintenance_breakdown: List[MaintenanceReportRow]
    is_simulated: bool = True