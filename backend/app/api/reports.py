import csv
import io
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.reports import ReportBundle
from app.services.reports_engine import build_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/", response_model=ReportBundle)
def get_report(
    machine_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    return build_report(db, machine_id, date_from, date_to)


@router.get("/export.csv")
def export_report_csv(
    machine_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    report = build_report(db, machine_id, date_from, date_to)

    buffer = io.StringIO()
    writer = csv.writer(buffer)

    writer.writerow(["SmartRetrofit 360 Report — Based on simulated/demo data"])
    writer.writerow([f"Generated at: {report.generated_at.isoformat()}"])
    writer.writerow([])

    writer.writerow(["Machine Performance"])
    writer.writerow(["Machine", "Uptime %", "Status", "Total Alerts", "Maintenance Events"])
    for row in report.machine_performance:
        writer.writerow([row.machine_name, row.uptime_pct, row.avg_health_status, row.total_alerts, row.total_maintenance_events])
    writer.writerow([])

    writer.writerow(["Sensor Trends"])
    writer.writerow(["Parameter", "Avg", "Min", "Max", "Reading Count"])
    for row in report.sensor_trends:
        writer.writerow([row.parameter, row.avg_value, row.min_value, row.max_value, row.reading_count])
    writer.writerow([])

    writer.writerow(["Alert Breakdown"])
    writer.writerow(["Level", "Count"])
    for row in report.alert_breakdown:
        writer.writerow([row.level, row.count])
    writer.writerow([])

    writer.writerow(["Maintenance Breakdown"])
    writer.writerow(["Type", "Total", "Completed"])
    for row in report.maintenance_breakdown:
        writer.writerow([row.maintenance_type, row.count, row.completed_count])

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smartretrofit360_report.csv"},
    )