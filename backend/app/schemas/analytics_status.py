from typing import Optional
from pydantic import BaseModel


class AnalyticsDataStatus(BaseModel):
    has_data: bool
    dataset_version: Optional[str]
    record_count: int
    is_synthetic_reference: bool
    message: str