"""
Derives energy metrics from current/voltage SensorReading rows produced
by the simulation engine (Step 7). Power is estimated using a simplified
single-phase formula for demo purposes:

    P (kW) = (V * I * power_factor) / 1000

power_factor is a fixed demo assumption (0.85), not a measured value.
This is clearly a simplification — real energy monitoring would need
actual power-factor measurement and possibly three-phase calculations.

Swap point for future hardware: once real current/voltage readings are
ingested (data_source="hardware"), this function needs no changes —
it already reads generically from SensorReading.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.machine import Machine
from app.models.sensor import Sensor, SensorType
from app.models.sensor_reading import SensorReading
from app.schemas.energy import EnergyOverview, EnergyTrendPoint, MachineEnergyComparison

DEMO_POWER_FACTOR = 0.85


def _latest_value(db: Session, machine_id: str, sensor_type: SensorType) -> tuple[float | None, datetime | None]:
    sensor = db.query(Sensor).filter(
        Sensor.machine_id == machine_id, Sensor.sensor_type == sensor_type
    ).first()
    if not sensor:
        return None, None

    latest = (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor.id)
        .order_by(desc(SensorReading.recorded_at))
        .first()
    )
    if not latest:
        return None, None
    return latest.value, latest.recorded_at


def _estimate_power_kw(current_a: float, voltage_v: float) -> float:
    return round((voltage_v * current_a * DEMO_POWER_FACTOR) / 1000, 3)


def build_energy_overview(db: Session, machine: Machine) -> EnergyOverview:
    current, current_ts = _latest_value(db, machine.id, SensorType.CURRENT)
    voltage, voltage_ts = _latest_value(db, machine.id, SensorType.VOLTAGE)

    power_kw = _estimate_power_kw(current, voltage) if current and voltage else None
    last_updated = max(filter(None, [current_ts, voltage_ts]), default=datetime.utcnow())

    # Rough daily energy estimate: average recent power draw over readings from today
    since_midnight = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    todays_readings = _power_series(db, machine.id, since_midnight)
    energy_today_kwh = _integrate_energy_kwh(todays_readings)

    # Operating duration: count of ticks with any active reading today, at engine interval
    operating_hours = round(len(todays_readings) * 5 / 3600, 2)  # 5s tick interval from Step 7

    return EnergyOverview(
        machine_id=machine.id,
        machine_name=machine.name,
        current_a=current,
        voltage_v=voltage,
        estimated_power_kw=power_kw,
        energy_today_kwh=round(energy_today_kwh, 3),
        operating_duration_hours=operating_hours,
        data_source="simulated",
        last_updated=last_updated,
    )


def _power_series(db: Session, machine_id: str, since: datetime) -> list[tuple[datetime, float]]:
    current_sensor = db.query(Sensor).filter(
        Sensor.machine_id == machine_id, Sensor.sensor_type == SensorType.CURRENT
    ).first()
    voltage_sensor = db.query(Sensor).filter(
        Sensor.machine_id == machine_id, Sensor.sensor_type == SensorType.VOLTAGE
    ).first()
    if not current_sensor or not voltage_sensor:
        return []

    current_readings = {
        r.recorded_at: r.value
        for r in db.query(SensorReading)
        .filter(SensorReading.sensor_id == current_sensor.id, SensorReading.recorded_at >= since)
        .all()
    }
    voltage_readings = {
        r.recorded_at: r.value
        for r in db.query(SensorReading)
        .filter(SensorReading.sensor_id == voltage_sensor.id, SensorReading.recorded_at >= since)
        .all()
    }

    common_timestamps = sorted(set(current_readings) & set(voltage_readings))
    return [
        (ts, _estimate_power_kw(current_readings[ts], voltage_readings[ts]))
        for ts in common_timestamps
    ]


def _integrate_energy_kwh(power_series: list[tuple[datetime, float]], tick_seconds: int = 5) -> float:
    """Simple sum-based energy integration: power(kW) * tick_duration(h), summed."""
    tick_hours = tick_seconds / 3600
    return sum(power for _, power in power_series) * tick_hours


def build_energy_trend(db: Session, machine: Machine, hours: int = 1) -> list[EnergyTrendPoint]:
    since = datetime.utcnow() - timedelta(hours=hours)
    series = _power_series(db, machine.id, since)
    return [EnergyTrendPoint(timestamp=ts, power_kw=power) for ts, power in series]


def build_machine_comparison(db: Session, machines: list[Machine]) -> list[MachineEnergyComparison]:
    since_midnight = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    results = []
    for machine in machines:
        series = _power_series(db, machine.id, since_midnight)
        energy_kwh = _integrate_energy_kwh(series)
        avg_power = round(sum(p for _, p in series) / len(series), 3) if series else 0.0
        results.append(MachineEnergyComparison(
            machine_id=machine.id,
            machine_name=machine.name,
            energy_today_kwh=round(energy_kwh, 3),
            avg_power_kw=avg_power,
        ))
    return results