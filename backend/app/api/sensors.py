from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sensor import Sensor
from app.schemas.sensor import SensorOut, ThresholdUpdate, SensorStateUpdate
from app.api.dependencies import require_role

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])


@router.get("/", response_model=List[SensorOut])
def list_sensors(machine_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Sensor)
    if machine_id:
        query = query.filter(Sensor.machine_id == machine_id)
    return query.all()


@router.get("/{sensor_id}", response_model=SensorOut)
def get_sensor(sensor_id: str, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor


@router.patch("/{sensor_id}/thresholds", response_model=SensorOut)
def update_thresholds(
    sensor_id: str,
    payload: ThresholdUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin", "engineer")),
):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sensor, field, value)

    db.commit()
    db.refresh(sensor)
    return sensor


@router.patch("/{sensor_id}/sampling", response_model=SensorOut)
def toggle_sampling(
    sensor_id: str,
    payload: SensorStateUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin", "engineer")),
):
    """
    Enables/disables the (future) data stream for this sensor.
    In the current phase this only flips a config flag — actual
    simulated sampling is wired up in Step 7.
    """
    from app.models.sensor import SensorState

    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    sensor.sampling_enabled = payload.sampling_enabled
    sensor.state = SensorState.NOT_CONFIGURED if not payload.sampling_enabled else SensorState.ACTIVE
    db.commit()
    db.refresh(sensor)
    return sensor