from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.machine import Machine
from app.schemas.dashboard import DashboardOverview
from app.services.dashboard_demo import generate_dashboard_snapshot

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/{machine_id}/overview", response_model=DashboardOverview)
def get_dashboard_overview(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return generate_dashboard_snapshot(machine)