"""
Builds the Dashboard overview from REAL data already produced by other
modules — live sensor readings (Step 7-8), energy engine (Step 11),
alerts (Step 9), and maintenance rules (Step 10/12) — instead of the
random generator used temporarily in Step 4.

This keeps the Dashboard honest: every number shown here traces back to
the same simulated sensor stream the rest of the app uses, not a
separate fake number generator.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.machine import Machine
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.models.alert import Alert, AlertStatus
from app.models.maintenance_record import MaintenanceRecord
from app.schemas.dashboard import (
    SensorSnapshot, TrendPoint, MaintenanceSummary, AlertSummary,
    EnergySummary, DashboardOverview,
)
from app.services.maintenance_rules import build_machine_health, build_recommendations
from app.services.energy_engine import build_energy_overview
from app.services.live_monitoring import build_live_snapshot


def _compute_trend(db: Session, sensor_id: str) -> str:
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor_id)
        .order_by(desc(SensorReading.recorded_at))
        .limit(2)
        .all()
    )
    if len(readings) < 2:
        return "stable"
    latest, previous = readings[0].value, readings[1].value
    if latest > previous:
        return "up"
    if latest < previous:
        return "down"
    return "stable"


def build_dashboard_overview(db: Session, machine: Machine) -> DashboardOverview:
    now = datetime.utcnow()
    sensors = db.query(Sensor).filter(Sensor.machine_id == machine.id).all()

    sensor_snapshots = []
    for sensor in sensors:
        latest = (
            db.query(SensorReading)
            .filter(SensorReading.sensor_id == sensor.id)
            .order_by(desc(SensorReading.recorded_at))
            .first()
        )
        if not latest:
            continue  # honest omission: no card for a sensor with no data yet
        sensor_snapshots.append(SensorSnapshot(
            parameter=sensor.sensor_type.value,
            value=latest.value,
            unit=sensor.unit,
            status=sensor.state.value if sensor.state.value != "not_configured" else "offline",
            trend=_compute_trend(db, sensor.id),
            last_updated=latest.recorded_at,
        ))

    # Reuse the same shared-timeline logic as Live Monitoring (Step 8)
    live_snapshot = build_live_snapshot(db, machine)
    trend_points = [
        TrendPoint(
            timestamp=p.timestamp, vibration=p.vibration, temperature=p.temperature,
            current=p.current, voltage=p.voltage, rpm=p.rpm,
        )
        for p in live_snapshot.history
    ]

    # Maintenance summary — real health + top recommendation + real records
    health = build_machine_health(machine)
    recommendations = build_recommendations(sensors)
    top_rec = recommendations[0] if recommendations else None

    next_maintenance = (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.machine_id == machine.id, MaintenanceRecord.is_completed == False)
        .order_by(MaintenanceRecord.scheduled_date.asc())
        .first()
    )
    recent_event = (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.machine_id == machine.id)
        .order_by(MaintenanceRecord.created_at.desc())
        .first()
    )

    maintenance = MaintenanceSummary(
        health_status=health.health_indicator,
        active_anomaly=top_rec.title if top_rec and top_rec.urgency != "low" else None,
        suggested_inspection=top_rec.detail if top_rec and top_rec.urgency == "high" else None,
        next_maintenance=(
            f"{next_maintenance.description} — {next_maintenance.scheduled_date.strftime('%Y-%m-%d')}"
            if next_maintenance and next_maintenance.scheduled_date
            else "No maintenance scheduled"
        ),
        recent_event=recent_event.description if recent_event else "No maintenance events recorded yet",
    )

    # Real active alert counts (same logic as /api/alerts/summary)
    active_alerts = db.query(Alert).filter(Alert.machine_id == machine.id, Alert.status == AlertStatus.ACTIVE).all()
    alerts_summary = AlertSummary(
        information=sum(1 for a in active_alerts if a.level.value == "information"),
        warning=sum(1 for a in active_alerts if a.level.value == "warning"),
        critical=sum(1 for a in active_alerts if a.level.value == "critical"),
    )

    # Real energy overview
    energy_overview = build_energy_overview(db, machine)
    energy = EnergySummary(
        current_power_kw=energy_overview.estimated_power_kw or 0.0,
        daily_energy_kwh=energy_overview.energy_today_kwh,
        weekly_trend_pct=0.0,  # honest placeholder: weekly comparison needs longer history than this prototype retains
    )

    return DashboardOverview(
        machine_id=machine.id,
        machine_name=machine.name,
        status=machine.status.value,
        connectivity=machine.connectivity.value,
        last_updated=now,
        data_source="simulated",
        sensors=sensor_snapshots,
        trend=trend_points,
        maintenance=maintenance,
        alerts=alerts_summary,
        energy=energy,
    )