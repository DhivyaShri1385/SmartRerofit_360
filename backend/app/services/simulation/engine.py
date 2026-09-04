"""
Background loop that ticks every SIMULATION_INTERVAL_SECONDS, generates
one reading per enabled sensor via the active provider, persists it,
and updates sensor/machine status derived from configured thresholds.

Swap point for future hardware: replace `_provider` with a
HardwareDataProvider instance (fed by the MQTT consumer) — no other
function in this file needs to change.
"""
import asyncio
import logging
from datetime import datetime

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.machine import Machine, MachineStatus, ConnectivityStatus
from app.models.sensor import Sensor, SensorState
from app.models.sensor_reading import SensorReading
from app.services.simulation.simulated_provider import SimulatedDataProvider

logger = logging.getLogger("smartretrofit.simulation")

SIMULATION_INTERVAL_SECONDS = 5

_provider = SimulatedDataProvider()   # single swap point for future hardware integration
_engine_running = True                # global pause/resume flag, controlled via API


def is_running() -> bool:
    return _engine_running


def set_running(value: bool) -> None:
    global _engine_running
    _engine_running = value


def _evaluate_sensor_state(sensor: Sensor, value: float) -> SensorState:
    if sensor.critical_max is not None and value >= sensor.critical_max:
        return SensorState.FAULT
    if sensor.critical_min is not None and value <= sensor.critical_min:
        return SensorState.FAULT
    if sensor.warning_max is not None and value >= sensor.warning_max:
        return SensorState.WARNING
    if sensor.warning_min is not None and value <= sensor.warning_min:
        return SensorState.WARNING
    return SensorState.ACTIVE


def _derive_machine_status(sensor_states: list[SensorState]) -> MachineStatus:
    if any(s == SensorState.FAULT for s in sensor_states):
        return MachineStatus.CRITICAL
    if any(s == SensorState.WARNING for s in sensor_states):
        return MachineStatus.WARNING
    if sensor_states:
        return MachineStatus.NORMAL
    return MachineStatus.OFFLINE


def run_tick(db: Session) -> None:
    now = datetime.utcnow()
    machines = db.query(Machine).filter(Machine.is_active == True).all()

    for machine in machines:
        if not machine.monitoring_enabled:
            machine.status = MachineStatus.OFFLINE
            machine.connectivity = ConnectivityStatus.OFFLINE
            continue

        sensors = db.query(Sensor).filter(Sensor.machine_id == machine.id).all()
        active_states = []
        any_reading_generated = False

        for sensor in sensors:
            value = _provider.generate_value(sensor, machine)
            if value is None:
                if sensor.sampling_enabled is False:
                    sensor.state = SensorState.NOT_CONFIGURED
                continue

            db.add(SensorReading(
                sensor_id=sensor.id,
                machine_id=machine.id,
                value=value,
                data_source=_provider.data_source_label,
                recorded_at=now,
            ))

            sensor.state = _evaluate_sensor_state(sensor, value)
            sensor.last_update = now
            active_states.append(sensor.state)
            any_reading_generated = True

        if any_reading_generated:
            machine.status = _derive_machine_status(active_states)
            machine.connectivity = ConnectivityStatus.ONLINE
            machine.last_communication = now
        else:
            machine.status = MachineStatus.OFFLINE
            machine.connectivity = ConnectivityStatus.OFFLINE

    db.commit()


async def run_simulation_loop() -> None:
    logger.info("Simulated data engine started (interval=%ss)", SIMULATION_INTERVAL_SECONDS)
    while True:
        if _engine_running:
            db = SessionLocal()
            try:
                run_tick(db)
            except Exception:
                logger.exception("Simulation tick failed")
                db.rollback()
            finally:
                db.close()
        await asyncio.sleep(SIMULATION_INTERVAL_SECONDS)