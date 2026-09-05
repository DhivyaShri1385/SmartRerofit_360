from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.machine import Machine
from app.schemas.live_monitoring import LiveMonitoringSnapshot
from app.services.live_monitoring import build_live_snapshot

router = APIRouter(prefix="/api/machines", tags=["Live Monitoring"])


@router.get("/{machine_id}/live", response_model=LiveMonitoringSnapshot)
def get_live_snapshot(machine_id: str, db: Session = Depends(get_db)):
    """
    Data source: SensorReading rows from the simulation engine (Step 7).
    WebSocket-ready note: this same build_live_snapshot() function can be
    pushed over a WebSocket on each tick instead of polled, without any
    change to the underlying data logic (see Step 18 - MQTT/WebSocket
    architecture).
    """
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return build_live_snapshot(db, machine)