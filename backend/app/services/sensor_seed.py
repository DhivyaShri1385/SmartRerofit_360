"""
Seeds the 5 planned sensor parameters for every seeded demo machine.
Sensors start in NOT_CONFIGURED state with sampling disabled — they only
begin producing values once the Simulated Data Engine (Step 7) is wired up.
"""
from sqlalchemy.orm import Session
from app.models.machine import Machine
from app.models.sensor import Sensor, SensorType, SensorState, SENSOR_UNITS

DEFAULT_THRESHOLDS = {
    SensorType.VIBRATION: {"warning_max": 4.0, "critical_max": 6.0},
    SensorType.TEMPERATURE: {"warning_max": 60.0, "critical_max": 75.0},
    SensorType.CURRENT: {"warning_max": 9.0, "critical_max": 11.0},
    SensorType.VOLTAGE: {"warning_min": 210.0, "critical_min": 200.0},
    SensorType.RPM: {"warning_max": 1500.0, "critical_max": 1700.0},
}


def seed_demo_sensors(db: Session) -> None:
    machines = db.query(Machine).filter(Machine.is_active == True).all()

    for machine in machines:
        for sensor_type in SensorType:
            exists = db.query(Sensor).filter(
                Sensor.machine_id == machine.id,
                Sensor.sensor_type == sensor_type,
            ).first()
            if exists:
                continue

            thresholds = DEFAULT_THRESHOLDS.get(sensor_type, {})
            db.add(Sensor(
                machine_id=machine.id,
                sensor_type=sensor_type,
                unit=SENSOR_UNITS[sensor_type],
                state=SensorState.NOT_CONFIGURED,
                sampling_enabled=False,
                is_demo=True,
                **thresholds,
            ))
    db.commit()