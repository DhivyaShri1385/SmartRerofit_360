"""
Predictive-maintenance analytics endpoints.
Operates exclusively on the external reference dataset table —
never on live/simulated sensor_readings.
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.ml_training import MLTrainingRecord
from app.models.ml_model_run import ModelRun
from app.schemas.ml_training import DatasetSummary, TrainRequest, ModelRunOut
from app.analytics.train import train_and_evaluate

router = APIRouter(prefix="/api/analytics", tags=["Predictive Maintenance Analytics"])

DEFAULT_DATASET_VERSION = "predictive_maintenance_v3"


@router.get("/dataset/summary", response_model=DatasetSummary)
def dataset_summary(dataset_version: str = DEFAULT_DATASET_VERSION, db: Session = Depends(get_db)):
    total = db.query(MLTrainingRecord).filter(
        MLTrainingRecord.dataset_version == dataset_version
    ).count()
    if total == 0:
        raise HTTPException(status_code=404, detail="Reference dataset not found. Run the importer script first.")

    machine_types = [r[0] for r in db.query(MLTrainingRecord.machine_type)
                      .filter(MLTrainingRecord.dataset_version == dataset_version).distinct().all()]
    date_min, date_max = db.query(
        func.min(MLTrainingRecord.timestamp), func.max(MLTrainingRecord.timestamp)
    ).filter(MLTrainingRecord.dataset_version == dataset_version).first()
    failures = db.query(MLTrainingRecord).filter(
        MLTrainingRecord.dataset_version == dataset_version,
        MLTrainingRecord.failure_within_24h == 1,
    ).count()

    return DatasetSummary(
        dataset_version=dataset_version,
        total_records=total,
        machine_types=machine_types,
        date_range_start=date_min,
        date_range_end=date_max,
        failure_rate_pct=round(100 * failures / total, 2),
        is_synthetic=True,
    )


@router.post("/train", response_model=ModelRunOut)
def train_model(payload: TrainRequest, db: Session = Depends(get_db)):
    result = train_and_evaluate(db, payload.dataset_version, payload.model_name)
    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    run = ModelRun(
        model_name=payload.model_name,
        dataset_version=payload.dataset_version,
        features_used=json.dumps(result["features_used"]),
        n_train_samples=result["n_train_samples"],
        n_test_samples=result["n_test_samples"],
        precision=result["precision"],
        recall=result["recall"],
        f1_score=result["f1_score"],
        roc_auc=result["roc_auc"],
        confusion_matrix=json.dumps(result["confusion_matrix"]),
        is_reference_dataset=True,
        notes="Evaluated on external/synthetic reference dataset. Not validated on Lathe-01 hardware.",
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return _to_out(run)


@router.get("/models", response_model=list[ModelRunOut])
def list_model_runs(db: Session = Depends(get_db)):
    return [_to_out(r) for r in db.query(ModelRun).order_by(ModelRun.trained_at.desc()).all()]


def _to_out(run: ModelRun) -> ModelRunOut:
    return ModelRunOut(
        id=run.id, model_name=run.model_name, dataset_version=run.dataset_version,
        trained_at=run.trained_at, features_used=json.loads(run.features_used),
        n_train_samples=run.n_train_samples, n_test_samples=run.n_test_samples,
        precision=run.precision, recall=run.recall, f1_score=run.f1_score, roc_auc=run.roc_auc,
        confusion_matrix=json.loads(run.confusion_matrix) if run.confusion_matrix else None,
        is_reference_dataset=run.is_reference_dataset, notes=run.notes,
    )