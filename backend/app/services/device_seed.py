"""
Seeds one demo IoT device per machine, e.g. ESP32-LATHE-01.
Every seeded device is NOT_REGISTERED — no physical ESP32 is connected.
This only prepares the data model and API surface for future hardware.
"""
from sqlalchemy.orm import Session
from app.models.machine import Machine
from app.models.device import Device, DeviceConnectionStatus


def seed_demo_devices(db: Session) -> None:
    machines = db.query(Machine).filter(Machine.is_active == True).all()

    for machine in machines:
        exists = db.query(Device).filter(Device.machine_id == machine.id).first()
        if exists:
            continue

        device_name = f"ESP32-{machine.name.upper().replace('-', '-')}"
        db.add(Device(
            machine_id=machine.id,
            device_name=device_name,
            device_type="ESP32",
            firmware_version="v0.1.0-planned",
            protocol="MQTT (planned)",
            mqtt_topic=f"smartretrofit/{machine.id}/#",
            connection_status=DeviceConnectionStatus.NOT_REGISTERED,
            is_demo=True,
        ))
    db.commit()