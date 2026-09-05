"""
Aggregates data already produced by other modules (sensor readings,
alerts, maintenance records) into report-shaped summaries. Does not
generate any new data — purely a read/aggregate layer, so it's
automatically consistent with every other page in the app.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.machine import Machine
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.models.alert import Alert
from app.models.maintenance_record import MaintenanceRecord
from app.schemas.reports import (
    MachinePerformanceReportRow, SensorTrendReportRow, AlertReportRow,
    MaintenanceReportRow, ReportBundle,
)


def build_report(
    db: Session,
    machine_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> ReportBundle:
    machines_query = db.query(Machine).filter(Machine.is_active == True)
    if machine_id:
        machines_query = machines_query.filter(Machine.id == machine_id)
    machines = machines_query.all()

    machine_performance = []
    for machine in machines:
        alert_query = db.query(Alert).filter(Alert.machine_id == machine.id)
        maint_query = db.query(MaintenanceRecord).filter(MaintenanceRecord.machine_id == machine.id)
        if date_from:
            alert_query = alert_query.filter(Alert.created_at >= date_from)
            maint_query = maint_query.filter(MaintenanceRecord.created_at >= date_from)
        if date_to:
            alert_query = alert_query.filter(Alert.created_at <= date_to)
            maint_query = maint_query.filter(MaintenanceRecord.created_at <= date_to)

        machine_performance.append(MachinePerformanceReportRow(
            machine_id=machine.id,
            machine_name=machine.name,
            uptime_pct=100.0 if machine.connectivity.value == "online" else 0.0,  # simplistic demo metric
            avg_health_status=machine.status.value,
            total_alerts=alert_query.count(),
            total_maintenance_events=maint_query.count(),
        ))

    # Sensor trends across selected machine(s)
    sensor_query = db.query(Sensor)
    if machine_id:
        sensor_query = sensor_query.filter(Sensor.machine_id == machine_id)
    sensors = sensor_query.all()

    sensor_trends = []
    for param in ["vibration", "temperature", "current", "voltage", "rpm"]:
        param_sensor_ids = [s.id for s in sensors if s.sensor_type.value == param]
        if not param_sensor_ids:
            continue

        reading_query = db.query(SensorReading).filter(SensorReading.sensor_id.in_(param_sensor_ids))
        if date_from:
            reading_query = reading_query.filter(SensorReading.recorded_at >= date_from)
        if date_to:
            reading_query = reading_query.filter(SensorReading.recorded_at <= date_to)

        agg = reading_query.with_entities(
            func.avg(SensorReading.value), func.min(SensorReading.value),
            func.max(SensorReading.value), func.count(SensorReading.id),
        ).first()

        if agg and agg[3] and agg[3] > 0:
            sensor_trends.append(SensorTrendReportRow(
                parameter=param,
                avg_value=round(agg[0], 2),
                min_value=round(agg[1], 2),
                max_value=round(agg[2], 2),
                reading_count=agg[3],
            ))

    # Alert breakdown by level
    alert_base = db.query(Alert)
    if machine_id:
        alert_base = alert_base.filter(Alert.machine_id == machine_id)
    if date_from:
        alert_base = alert_base.filter(Alert.created_at >= date_from)
    if date_to:
        alert_base = alert_base.filter(Alert.created_at <= date_to)

    alert_breakdown = [
        AlertReportRow(level=level, count=alert_base.filter(Alert.level == level).count())
        for level in ["information", "warning", "critical"]
    ]

    # Maintenance breakdown by type
    maint_base = db.query(MaintenanceRecord)
    if machine_id:
        maint_base = maint_base.filter(MaintenanceRecord.machine_id == machine_id)
    if date_from:
        maint_base = maint_base.filter(MaintenanceRecord.created_at >= date_from)
    if date_to:
        maint_base = maint_base.filter(MaintenanceRecord.created_at <= date_to)

    maintenance_breakdown = []
    for mtype in ["preventive", "corrective", "inspection", "condition_based"]:
        type_query = maint_base.filter(MaintenanceRecord.maintenance_type == mtype)
        maintenance_breakdown.append(MaintenanceReportRow(
            maintenance_type=mtype,
            count=type_query.count(),
            completed_count=type_query.filter(MaintenanceRecord.is_completed == True).count(),
        ))

    return ReportBundle(
        generated_at=datetime.utcnow(),
        date_from=date_from,
        date_to=date_to,
        machine_performance=machine_performance,
        sensor_trends=sensor_trends,
        alert_breakdown=alert_breakdown,
        maintenance_breakdown=maintenance_breakdown,
        is_simulated=True,
    )