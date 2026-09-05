"""
Shared ingestion path for hardware-sourced sensor readings. Reuses the
exact same evaluation and alert logic as the simulator, so switching
from simulated to real hardware data changes nothing about how
alerts/status are computed — only where the number came from.
"""
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.device import Device, DeviceConnectionStatus
from app.models.sensor import Sensor, SensorType
from app.models.sensor_reading import SensorReading
from app.models.machine import ConnectivityStatus
from app.mqtt.schemas import MQTTSensorMessage
from app.services.sensor_evaluation import evaluate_sensor_state, derive_machine_status
from app.services.alert_engine import evaluate_and_generate_alerts


class IngestionError(Exception):
    pass


def ingest_hardware_reading(db: Session, message: MQTTSensorMessage) -> SensorReading:
    device = db.query(Device).filter(Device.device_name == message.device_id).first()
    if not device:
        raise IngestionError(f"Unknown device_id '{message.device_id}' — device is not registered")

    if device.machine_id != message.machine_id:
        raise IngestionError(
            f"machine_id mismatch: device '{message.device_id}' is registered to a different machine"
        )

    sensor = db.query(Sensor).filter(
        Sensor.machine_id == message.machine_id,
        Sensor.sensor_type == SensorType(message.sensor),
    ).first()
    if not sensor:
        raise IngestionError(f"No sensor of type '{message.sensor}' configured for this machine")

    reading = SensorReading(
        sensor_id=sensor.id,
        machine_id=message.machine_id,
        value=message.value,
        data_source="hardware",
        recorded_at=message.timestamp,
    )
    db.add(reading)

    previous_state = sensor.state
    new_state = evaluate_sensor_state(sensor, message.value)
    evaluate_and_generate_alerts(db, sensor, previous_state, new_state, message.value)
    sensor.state = new_state
    sensor.last_update = message.timestamp

    device.last_seen = datetime.utcnow()
    device.last_message = f"{message.sensor}={message.value}{message.unit}"
    device.connection_status = DeviceConnectionStatus.ONLINE

    machine = device.machine
    machine.connectivity = ConnectivityStatus.ONLINE
    machine.last_communication = datetime.utcnow()
    all_sensor_states = [s.state for s in db.query(Sensor).filter(Sensor.machine_id == machine.id).all()]
    machine.status = derive_machine_status(all_sensor_states)

    db.commit()
    db.refresh(reading)
    return reading