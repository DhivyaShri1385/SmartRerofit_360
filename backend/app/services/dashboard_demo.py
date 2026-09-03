"""
Generates a SIMULATED dashboard snapshot for a machine.

This is demo data for UI development only — no physical hardware is
connected. Every response is tagged data_source="simulated" and the
frontend must display this visibly.

Swap point for later: replace generate_dashboard_snapshot() internals
with a query against real sensor_readings once ESP32/MQTT ingestion
exists. The DashboardOverview schema stays identical either way, so
no frontend changes will be needed.
"""
import random
from datetime import datetime, timedelta

from app.models.machine import Machine
from app.schemas.dashboard import (
    SensorSnapshot, TrendPoint, MaintenanceSummary, AlertSummary,
    EnergySummary, DashboardOverview,
)

SENSOR_CONFIG = {
    "vibration": {"unit": "mm/s", "range": (1.0, 3.5)},
    "temperature": {"unit": "°C", "range": (35.0, 55.0)},
    "current": {"unit": "A", "range": (4.0, 8.0)},
    "voltage": {"unit": "V", "range": (215.0, 230.0)},
    "rpm": {"unit": "RPM", "range": (800.0, 1400.0)},
}


def _random_status() -> str:
    roll = random.random()
    if roll < 0.75:
        return "normal"
    elif roll < 0.93:
        return "warning"
    return "critical"


def _generate_sensors(now: datetime) -> list[SensorSnapshot]:
    sensors = []
    for param, cfg in SENSOR_CONFIG.items():
        low, high = cfg["range"]
        sensors.append(SensorSnapshot(
            parameter=param,
            value=round(random.uniform(low, high), 2),
            unit=cfg["unit"],
            status=_random_status(),
            trend=random.choice(["up", "down", "stable"]),
            last_updated=now,
        ))
    return sensors


def _generate_trend(now: datetime, points: int = 30) -> list[TrendPoint]:
    trend = []
    for i in range(points, 0, -1):
        ts = now - timedelta(minutes=i * 2)
        trend.append(TrendPoint(
            timestamp=ts,
            vibration=round(random.uniform(1.0, 3.5), 2),
            temperature=round(random.uniform(35.0, 55.0), 2),
            current=round(random.uniform(4.0, 8.0), 2),
            voltage=round(random.uniform(215.0, 230.0), 2),
            rpm=round(random.uniform(800.0, 1400.0), 2),
        ))
    return trend


def generate_dashboard_snapshot(machine: Machine) -> DashboardOverview:
    now = datetime.utcnow()
    sensors = _generate_sensors(now)

    worst = "normal"
    for s in sensors:
        if s.status == "critical":
            worst = "critical"
            break
        if s.status == "warning" and worst != "critical":
            worst = "warning"

    return DashboardOverview(
        machine_id=machine.id,
        machine_name=machine.name,
        status=worst,
        connectivity="offline",  # honest: no hardware connected yet
        last_updated=now,
        data_source="simulated",
        sensors=sensors,
        trend=_generate_trend(now),
        maintenance=MaintenanceSummary(
            health_status="Fair" if worst != "normal" else "Good",
            active_anomaly="Elevated vibration trend" if worst != "normal" else None,
            suggested_inspection="Inspect spindle bearing" if worst == "critical" else None,
            next_maintenance="Scheduled preventive check — demo placeholder",
            recent_event="No maintenance events recorded yet",
        ),
        alerts=AlertSummary(
            information=random.randint(0, 3),
            warning=random.randint(0, 2) if worst != "normal" else 0,
            critical=1 if worst == "critical" else 0,
        ),
        energy=EnergySummary(
            current_power_kw=round(random.uniform(1.2, 3.8), 2),
            daily_energy_kwh=round(random.uniform(18.0, 42.0), 1),
            weekly_trend_pct=round(random.uniform(-8.0, 8.0), 1),
        ),
    )