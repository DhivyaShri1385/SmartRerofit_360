"""
Metadata + evaluation metrics for each predictive-maintenance model
training run, computed ONLY on a reference dataset.

These metrics describe model behavior on that reference data — they
are NOT a claim about performance on real Lathe-01 hardware. Keep
`is_reference_dataset=True` and surface it in the UI at all times.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from datetime import datetime
from app.database import Base


class ModelRun(Base):
    __tablename__ = "model_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String, nullable=False)          # random_forest | isolation_forest | xgboost
    dataset_version = Column(String, nullable=False)
    trained_at = Column(DateTime, default=datetime.utcnow)

    features_used = Column(Text, nullable=False)          # JSON-encoded list
    n_train_samples = Column(Integer, nullable=False)
    n_test_samples = Column(Integer, nullable=False)

    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)
    confusion_matrix = Column(Text, nullable=True)        # JSON-encoded 2x2 matrix

    is_reference_dataset = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)