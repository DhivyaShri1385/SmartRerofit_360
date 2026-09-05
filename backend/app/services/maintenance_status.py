"""
Derives a display status for a maintenance record without storing it
directly — overdue is time-relative and shouldn't require a background
job to keep in sync.
"""
from datetime import datetime
from app.models.maintenance_record import MaintenanceRecord


def compute_status(record: MaintenanceRecord) -> str:
    if record.is_completed:
        return "completed"
    if record.scheduled_date and record.scheduled_date < datetime.utcnow():
        return "overdue"
    if record.scheduled_date:
        return "scheduled"
    return "in_progress"


def to_out_dict(record: MaintenanceRecord) -> dict:
    return {
        "id": record.id,
        "machine_id": record.machine_id,
        "maintenance_type": record.maintenance_type,
        "description": record.description,
        "performed_by": record.performed_by,
        "parts_used": record.parts_used,
        "notes": record.notes,
        "scheduled_date": record.scheduled_date,
        "completed_date": record.completed_date,
        "is_completed": record.is_completed,
        "status": compute_status(record),
        "source": record.source,
        "is_demo": record.is_demo,
        "created_at": record.created_at,
    }