from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.schemas.sensor_reading import SensorReadingOut

router = APIRouter(prefix="/api/sensor-readings", tags=["Sensor Readings"])


@router.get("/{sensor_id}/latest", response_model=SensorReadingOut | None)
def get_latest_reading(sensor_id: str, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    return (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor_id)
        .order_by(SensorReading.recorded_at.desc())
        .first()
    )


@router.get("/{sensor_id}/history", response_model=List[SensorReadingOut])
def get_reading_history(
    sensor_id: str,
    limit: int = Query(default=60, le=1000),
    db: Session = Depends(get_db),
):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    readings = (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor_id)
        .order_by(SensorReading.recorded_at.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(readings))