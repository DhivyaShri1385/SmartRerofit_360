"""
Builds the Live Monitoring snapshot for a machine.

Data source today: SensorReading rows written by the simulation engine
(Step 7). Because engine.run_tick() stamps every reading generated in
the same tick with an identical `recorded_at`, readings naturally group
into a shared timeline across all 5 parameters — no interpolation needed.

Swap point for future hardware: once ESP32/MQTT ingestion writes rows
into the same sensor_readings table (data_source="hardware"), this
function requires no changes — it already reads generically from
SensorReading regardless of origin.
"""
from datetime import datetime, timedelta
from collections import defaultdict

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.machine import Machine
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.schemas.live_monitoring import LiveSensorPoint, LiveHistoryPoint, LiveMonitoringSnapshot
from app.services.simulation.engine import SIMULATION_INTERVAL_SECONDS

STALE_AFTER_SECONDS = SIMULATION_INTERVAL_SECONDS * 3  # missed ~3 ticks = considered stale
HISTORY_TICKS = 40


def build_live_snapshot(db: Session, machine: Machine) -> LiveMonitoringSnapshot:
    now = datetime.utcnow()
    sensors = db.query(Sensor).filter(Sensor.machine_id == machine.id).all()

    sensor_points: list[LiveSensorPoint] = []
    for sensor in sensors:
        latest = (
            db.query(SensorReading)
            .filter(SensorReading.sensor_id == sensor.id)
            .order_by(desc(SensorReading.recorded_at))
            .first()
        )
        is_stale = True
        if latest and (now - latest.recorded_at) <= timedelta(seconds=STALE_AFTER_SECONDS):
            is_stale = False

        sensor_points.append(LiveSensorPoint(
            sensor_id=sensor.id,
            parameter=sensor.sensor_type.value,
            unit=sensor.unit,
            state=sensor.state.value,
            value=latest.value if latest else None,
            last_update=latest.recorded_at if latest else None,
            is_stale=is_stale,
        ))

    # Merge recent ticks into one shared timeline (readings from the same
    # tick share an identical recorded_at — see engine.run_tick).
    recent_readings = (
        db.query(SensorReading, Sensor.sensor_type)
        .join(Sensor, Sensor.id == SensorReading.sensor_id)
        .filter(SensorReading.machine_id == machine.id)
        .order_by(desc(SensorReading.recorded_at))
        .limit(HISTORY_TICKS * 5)  # up to 5 parameters per tick
        .all()
    )

    grouped: dict[datetime, dict] = defaultdict(dict)
    for reading, sensor_type in recent_readings:
        grouped[reading.recorded_at][sensor_type.value] = reading.value

    history = [
        LiveHistoryPoint(timestamp=ts, **values)
        for ts, values in sorted(grouped.items())
    ][-HISTORY_TICKS:]

    return LiveMonitoringSnapshot(
        machine_id=machine.id,
        machine_name=machine.name,
        status=machine.status.value,
        connectivity=machine.connectivity.value,
        monitoring_enabled=machine.monitoring_enabled,
        data_source="simulated",
        server_time=now,
        sensors=sensor_points,
        history=history,
    )