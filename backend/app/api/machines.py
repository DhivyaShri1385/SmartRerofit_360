from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.machine import Machine
from app.schemas.machine import MachineCreate, MachineUpdate, MachineOut
from app.api.dependencies import require_role

router = APIRouter(prefix="/api/machines", tags=["Machines"])


@router.get("/", response_model=List[MachineOut])
def list_machines(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    return (
        db.query(Machine)
        .filter(Machine.is_active == True)
        .order_by(Machine.name)
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.get("/{machine_id}", response_model=MachineOut)
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.post("/", response_model=MachineOut, status_code=201)
def create_machine(
    payload: MachineCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
):
    existing = db.query(Machine).filter(Machine.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A machine with this name already exists")

    machine = Machine(**payload.model_dump(), is_demo=False)
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


@router.patch("/{machine_id}", response_model=MachineOut)
def update_machine(
    machine_id: str,
    payload: MachineUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(machine, field, value)

    db.commit()
    db.refresh(machine)
    return machine


@router.patch("/{machine_id}/monitoring", response_model=MachineOut)
def toggle_monitoring(machine_id: str, enabled: bool, db: Session = Depends(get_db)):
    """Dedicated endpoint for the Enable/Disable Monitoring action."""
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    machine.monitoring_enabled = enabled
    db.commit()
    db.refresh(machine)
    return machine


@router.delete("/{machine_id}", status_code=204)
def deactivate_machine(
    machine_id: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    machine.is_active = False
    db.commit()
    return None