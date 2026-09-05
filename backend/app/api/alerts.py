from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert, AlertStatus
from app.schemas.alert import AlertOut, AlertSummary
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/", response_model=List[AlertOut])
def list_alerts(
    machine_id: Optional[str] = None,
    level: Optional[str] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Alert)
    if machine_id:
        query = query.filter(Alert.machine_id == machine_id)
    if level:
        query = query.filter(Alert.level == level)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if date_from:
        query = query.filter(Alert.created_at >= date_from)
    if date_to:
        query = query.filter(Alert.created_at <= date_to)
    return query.order_by(Alert.created_at.desc()).limit(200).all()


@router.get("/summary", response_model=AlertSummary)
def get_alert_summary(machine_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE)
    if machine_id:
        query = query.filter(Alert.machine_id == machine_id)
    active = query.all()

    return AlertSummary(
        information=sum(1 for a in active if a.level.value == "information"),
        warning=sum(1 for a in active if a.level.value == "warning"),
        critical=sum(1 for a in active if a.level.value == "critical"),
        total_active=len(active),
    )


@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.patch("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = AlertStatus.ACKNOWLEDGED
    alert.acknowledged_at = datetime.utcnow()
    alert.acknowledged_by = current_user.username
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = AlertStatus.RESOLVED
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert