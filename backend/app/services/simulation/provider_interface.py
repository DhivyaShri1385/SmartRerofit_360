"""
Abstraction boundary between "where sensor values come from" and
"what the rest of the app does with them". Everything downstream
(engine, API, frontend) depends only on this interface.
"""
from abc import ABC, abstractmethod
from typing import Optional

from app.models.sensor import Sensor
from app.models.machine import Machine


class SensorDataProvider(ABC):
    @abstractmethod
    def generate_value(self, sensor: Sensor, machine: Machine) -> Optional[float]:
        """Return one reading for this sensor, or None if unavailable."""
        raise NotImplementedError

    @property
    @abstractmethod
    def data_source_label(self) -> str:
        """'simulated' or 'hardware' — stamped onto every stored reading."""
        raise NotImplementedError