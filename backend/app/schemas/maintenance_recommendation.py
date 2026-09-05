from typing import Optional, List
from pydantic import BaseModel


class MachineHealthOut(BaseModel):
    machine_id: str
    machine_name: str
    health_indicator: str        # Good | Fair | Poor
    condition: str                 # normal | warning | critical | offline
    trend: str                      # improving | stable | degrading
    anomaly_status: str             # normal | warning | critical
    is_simulated: bool = True


class RecommendationOut(BaseModel):
    title: str
    detail: str
    urgency: str  # low | medium | high
    is_demo_rule: bool = True