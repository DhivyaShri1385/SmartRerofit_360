from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SensorSnapshot(BaseModel):
    parameter: str          # vibration | temperature | current | voltage | rpm
    value: float
    unit: str
    status: str              # normal | warning | critical
    trend: str                # up | down | stable
    last_updated: datetime


class TrendPoint(BaseModel):
    timestamp: datetime
    vibration: Optional[float] = None
    temperature: Optional[float] = None
    current: Optional[float] = None
    voltage: Optional[float] = None
    rpm: Optional[float] = None


class MaintenanceSummary(BaseModel):
    health_status: str
    active_anomaly: Optional[str]
    suggested_inspection: Optional[str]
    next_maintenance: Optional[str]
    recent_event: Optional[str]


class AlertSummary(BaseModel):
    information: int
    warning: int
    critical: int


class EnergySummary(BaseModel):
    current_power_kw: float
    daily_energy_kwh: float
    weekly_trend_pct: float


class DashboardOverview(BaseModel):
    machine_id: str
    machine_name: str
    status: str
    connectivity: str
    last_updated: datetime
    data_source: str = "simulated"
    sensors: List[SensorSnapshot]
    trend: List[TrendPoint]
    maintenance: MaintenanceSummary
    alerts: AlertSummary
    energy: EnergySummary