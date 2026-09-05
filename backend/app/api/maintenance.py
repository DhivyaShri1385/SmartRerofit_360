from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance_record import MaintenanceRecord
from app.schemas.maintenance_record import (
    MaintenanceRecordCreate, MaintenanceRecordUpdate, MaintenanceRecordOut, MaintenanceOverview,
)
from app.services.maintenance_status import compute_status, to_out_dict
from app.api.dependencies import require_role

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance Management"])


@router.get("/", response_model=List[MaintenanceRecordOut])
def list_records(
    machine_id: Optional[str] = None,
    maintenance_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(MaintenanceRecord)
    if machine_id:
        query = query.filter(MaintenanceRecord.machine_id == machine_id)
    if maintenance_type:
        query = query.filter(MaintenanceRecord.maintenance_type == maintenance_type)
    if search:
        query = query.filter(MaintenanceRecord.description.ilike(f"%{search}%"))

    records = query.order_by(MaintenanceRecord.created_at.desc()).offset(offset).limit(limit).all()
    return [to_out_dict(r) for r in records]

@router.get("/overview", response_model=MaintenanceOverview)
def get_overview(machine_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MaintenanceRecord)
    if machine_id:
        query = query.filter(MaintenanceRecord.machine_id == machine_id)
    all_records = query.all()

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    upcoming = [r for r in all_records if not r.is_completed and r.scheduled_date and r.scheduled_date >= now]
    overdue = [r for r in all_records if not r.is_completed and r.scheduled_date and r.scheduled_date < now]
    completed_this_month = [
        r for r in all_records
        if r.is_completed and r.completed_date and r.completed_date >= month_start
    ]
    recent = sorted(all_records, key=lambda r: r.created_at, reverse=True)[:5]

    return MaintenanceOverview(
        upcoming_count=len(upcoming),
        overdue_count=len(overdue),
        completed_this_month=len(completed_this_month),
        recent=[to_out_dict(r) for r in recent],
    )


@router.get("/{record_id}", response_model=MaintenanceRecordOut)
def get_record(record_id: str, db: Session = Depends(get_db)):
    record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return to_out_dict(record)


@router.post("/", response_model=MaintenanceRecordOut, status_code=201)
def create_record(
    payload: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin", "engineer")),
):
    record = MaintenanceRecord(**payload.model_dump(), is_demo=True)
    db.add(record)
    db.commit()
    db.refresh(record)
    return to_out_dict(record)


@router.patch("/{record_id}", response_model=MaintenanceRecordOut)
def update_record(
    record_id: str,
    payload: MaintenanceRecordUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin", "engineer")),
):
    record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    if update_data.get("is_completed") and not record.completed_date:
        record.completed_date = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return to_out_dict(record)


@router.delete("/{record_id}", status_code=204)
def delete_record(
    record_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
):
    record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    db.delete(record)
    db.commit()
    return None