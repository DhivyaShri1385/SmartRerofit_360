from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class EnergyOverview(BaseModel):
    machine_id: str
    machine_name: str
    current_a: Optional[float]
    voltage_v: Optional[float]
    estimated_power_kw: Optional[float]
    energy_today_kwh: float
    operating_duration_hours: float
    data_source: str = "simulated"
    last_updated: datetime


class EnergyTrendPoint(BaseModel):
    timestamp: datetime
    power_kw: float


class MachineEnergyComparison(BaseModel):
    machine_id: str
    machine_name: str
    energy_today_kwh: float
    avg_power_kw: float