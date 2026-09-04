from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SensorReadingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    sensor_id: str
    machine_id: str
    value: float
    data_source: str
    recorded_at: datetime