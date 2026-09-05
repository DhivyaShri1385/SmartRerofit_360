from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.machine import Machine
from app.models.sensor import Sensor
from app.schemas.maintenance_recommendation import MachineHealthOut, RecommendationOut
from app.services.maintenance_rules import build_machine_health, build_recommendations

router = APIRouter(prefix="/api/predictive-maintenance", tags=["Predictive Maintenance"])


@router.get("/{machine_id}/health", response_model=MachineHealthOut)
def get_machine_health(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return build_machine_health(machine)


@router.get("/{machine_id}/recommendations", response_model=List[RecommendationOut])
def get_recommendations(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    sensors = db.query(Sensor).filter(Sensor.machine_id == machine_id).all()
    return build_recommendations(sensors)