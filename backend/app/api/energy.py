from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.machine import Machine
from app.schemas.energy import EnergyOverview, EnergyTrendPoint, MachineEnergyComparison
from app.services.energy_engine import build_energy_overview, build_energy_trend, build_machine_comparison

router = APIRouter(prefix="/api/energy", tags=["Energy Monitoring"])


@router.get("/{machine_id}/overview", response_model=EnergyOverview)
def get_energy_overview(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return build_energy_overview(db, machine)


@router.get("/{machine_id}/trend", response_model=List[EnergyTrendPoint])
def get_energy_trend(
    machine_id: str,
    hours: int = Query(default=1, le=168),  # up to a week (shift/daily/weekly ranges)
    db: Session = Depends(get_db),
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return build_energy_trend(db, machine, hours)


@router.get("/comparison", response_model=List[MachineEnergyComparison])
def get_machine_comparison(db: Session = Depends(get_db)):
    machines = db.query(Machine).filter(Machine.is_active == True).all()
    return build_machine_comparison(db, machines)