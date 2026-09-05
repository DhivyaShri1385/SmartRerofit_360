from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.device import Device
from app.models.sensor import Sensor
from app.schemas.device import DeviceOut, DeviceUpdate, SensorMappingOut
from app.api.dependencies import require_role

router = APIRouter(prefix="/api/devices", tags=["IoT Device Management"])


@router.get("/", response_model=List[DeviceOut])
def list_devices(machine_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Device)
    if machine_id:
        query = query.filter(Device.machine_id == machine_id)
    return query.all()


@router.get("/{device_id}", response_model=DeviceOut)
def get_device(device_id: str, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.get("/{device_id}/sensor-mapping", response_model=List[SensorMappingOut])
def get_sensor_mapping(device_id: str, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    sensors = db.query(Sensor).filter(Sensor.machine_id == device.machine_id).all()
    return [
        SensorMappingOut(
            sensor_id=s.id,
            parameter=s.sensor_type.value,
            unit=s.unit,
            state=s.state.value,
        )
        for s in sensors
    ]


@router.patch("/{device_id}", response_model=DeviceOut)
def update_device(
    device_id: str,
    payload: DeviceUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin", "engineer")),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(device, field, value)

    db.commit()
    db.refresh(device)
    return device