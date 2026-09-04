"""
SIMULATED DATA PROVIDER
========================
Generates demo sensor values with realistic temporal behavior:
normal baseline noise, slow drift (e.g. gradually rising vibration),
and occasional transient abnormal spikes to exercise the alert/status
pipeline. No physical hardware is involved anywhere in this module.
"""
import math
import random
import time
from typing import Optional

from app.models.sensor import Sensor, SensorType
from app.models.machine import Machine
from app.services.simulation.provider_interface import SensorDataProvider

BASELINES = {
    SensorType.VIBRATION: {"base": 2.0, "noise": 0.4, "drift_amplitude": 1.2},
    SensorType.TEMPERATURE: {"base": 45.0, "noise": 2.5, "drift_amplitude": 8.0},
    SensorType.CURRENT: {"base": 6.0, "noise": 0.6, "drift_amplitude": 1.5},
    SensorType.VOLTAGE: {"base": 222.0, "noise": 2.0, "drift_amplitude": -6.0},
    SensorType.RPM: {"base": 1100.0, "noise": 40.0, "drift_amplitude": 150.0},
}

SPIKE_PROBABILITY = 0.04          # chance per tick of a transient abnormal reading
DRIFT_PERIOD_SECONDS = 600         # slow sine-wave cycle simulating gradual condition change


class SimulatedDataProvider(SensorDataProvider):
    """
    Stateless across ticks except for a lightweight per-sensor phase
    offset so each sensor's drift cycle looks independent rather than
    perfectly synchronized.
    """

    def __init__(self):
        self._phase_offsets: dict[str, float] = {}

    @property
    def data_source_label(self) -> str:
        return "simulated"

    def _phase_for(self, sensor_id: str) -> float:
        if sensor_id not in self._phase_offsets:
            self._phase_offsets[sensor_id] = random.uniform(0, 2 * math.pi)
        return self._phase_offsets[sensor_id]

    def generate_value(self, sensor: Sensor, machine: Machine) -> Optional[float]:
        if not sensor.sampling_enabled or not machine.monitoring_enabled:
            return None

        cfg = BASELINES.get(sensor.sensor_type)
        if not cfg:
            return None

        # Slow oscillating drift — simulates gradual real-world condition change
        phase = self._phase_for(sensor.id)
        t = time.time()
        drift_factor = math.sin((t / DRIFT_PERIOD_SECONDS) + phase)
        value = cfg["base"] + drift_factor * cfg["drift_amplitude"] * 0.5

        # Baseline sensor noise
        value += random.gauss(0, cfg["noise"])

        # Occasional transient abnormal spike (simulates a temporary fault condition)
        if random.random() < SPIKE_PROBABILITY:
            spike_direction = 1 if cfg["drift_amplitude"] >= 0 else -1
            value += spike_direction * cfg["drift_amplitude"] * random.uniform(1.5, 2.5)

        return round(value, 2)