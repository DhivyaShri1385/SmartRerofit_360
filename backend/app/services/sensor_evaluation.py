"""
Shared sensor-state and machine-status derivation logic, used by both
the simulation engine and the MQTT ingestion path.
"""
from app.models.sensor import Sensor, SensorState
from app.models.machine import MachineStatus


def evaluate_sensor_state(sensor: Sensor, value: float) -> SensorState:
    if sensor.critical_max is not None and value >= sensor.critical_max:
        return SensorState.FAULT
    if sensor.critical_min is not None and value <= sensor.critical_min:
        return SensorState.FAULT
    if sensor.warning_max is not None and value >= sensor.warning_max:
        return SensorState.WARNING
    if sensor.warning_min is not None and value <= sensor.warning_min:
        return SensorState.WARNING
    return SensorState.ACTIVE


def derive_machine_status(sensor_states: list[SensorState]) -> MachineStatus:
    if any(s == SensorState.FAULT for s in sensor_states):
        return MachineStatus.CRITICAL
    if any(s == SensorState.WARNING for s in sensor_states):
        return MachineStatus.WARNING
    if sensor_states:
        return MachineStatus.NORMAL
    return MachineStatus.OFFLINE