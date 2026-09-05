"""
Rule-based alert generation, triggered from the simulation engine
whenever a sensor's evaluated state changes. Kept as a standalone
module (not embedded in engine.py) so future ML-generated alerts
(Predictive Maintenance) can call create logic independently without
duplicating the dedup/auto-resolve behavior here.
"""
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.sensor import Sensor, SensorState
from app.models.alert import Alert, AlertLevel, AlertStatus

STATE_TO_LEVEL = {
    SensorState.WARNING: AlertLevel.WARNING,
    SensorState.FAULT: AlertLevel.CRITICAL,
}


def _find_open_alert(db: Session, sensor_id: str) -> Alert | None:
    return (
        db.query(Alert)
        .filter(Alert.sensor_id == sensor_id, Alert.status == AlertStatus.ACTIVE)
        .order_by(Alert.created_at.desc())
        .first()
    )


def evaluate_and_generate_alerts(
    db: Session,
    sensor: Sensor,
    previous_state: SensorState,
    new_state: SensorState,
    value: float,
) -> None:
    """Call after computing new_state but before committing sensor.state."""
    now = datetime.utcnow()

    # Recovery: sensor moved back to ACTIVE (normal) from an abnormal state —
    # auto-resolve any open alert for this sensor.
    if new_state == SensorState.ACTIVE and previous_state in (SensorState.WARNING, SensorState.FAULT):
        open_alert = _find_open_alert(db, sensor.id)
        if open_alert:
            open_alert.status = AlertStatus.RESOLVED
            open_alert.resolved_at = now
            open_alert.auto_resolved = "true"
        return

    # New or escalating abnormal condition
    level = STATE_TO_LEVEL.get(new_state)
    if level is None:
        return

    existing = _find_open_alert(db, sensor.id)
    if existing and existing.level == level:
        # Same severity already open — avoid duplicate spam, don't re-alert every tick.
        return

    if existing and existing.level != level:
        # Severity changed (e.g. warning -> critical) — resolve the old one, open a new one.
        existing.status = AlertStatus.RESOLVED
        existing.resolved_at = now
        existing.auto_resolved = "true"

    param_label = sensor.sensor_type.value.capitalize()
    message = (
        f"{param_label} reading of {value} {sensor.unit} is in {level.value} range"
        if level != AlertLevel.INFORMATION
        else f"{param_label} operating normally"
    )

    db.add(Alert(
        machine_id=sensor.machine_id,
        sensor_id=sensor.id,
        level=level,
        status=AlertStatus.ACTIVE,
        parameter=sensor.sensor_type.value,
        message=message,
        value_at_trigger=value,
        source="rule_based",
        data_source="simulated",
    ))