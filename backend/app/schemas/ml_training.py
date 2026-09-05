from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class DatasetSummary(BaseModel):
    dataset_version: str
    total_records: int
    machine_types: List[str]
    date_range_start: Optional[datetime]
    date_range_end: Optional[datetime]
    failure_rate_pct: float
    is_synthetic: bool = True


class TrainRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_name: str  # "isolation_forest" | "random_forest" | "xgboost"
    dataset_version: str = "predictive_maintenance_v3"


class ModelRunOut(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    id: int
    model_name: str
    dataset_version: str
    trained_at: datetime
    features_used: List[str]
    n_train_samples: int
    n_test_samples: int
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    roc_auc: Optional[float]
    confusion_matrix: Optional[List[List[int]]]
    is_reference_dataset: bool
    notes: Optional[str]