"""
Rule-based (NOT ML-based) maintenance recommendation demo logic, driven
by current sensor states from the simulation engine. These are canned
demo rules for UI/workflow demonstration — not a trained model's output.

This is intentionally separate from the ML analytics pipeline
(app/analytics/), which operates only on the external reference dataset.
"""
from app.models.sensor import Sensor, SensorState
from app.models.machine import Machine
from app.schemas.maintenance_recommendation import MachineHealthOut, RecommendationOut

HEALTH_MAP = {
    "normal": "Good",
    "warning": "Fair",
    "critical": "Poor",
    "offline": "Unknown",
}


def build_machine_health(machine: Machine) -> MachineHealthOut:
    return MachineHealthOut(
        machine_id=machine.id,
        machine_name=machine.name,
        health_indicator=HEALTH_MAP.get(machine.status.value, "Unknown"),
        condition=machine.status.value,
        trend="stable",  # simplistic demo trend; real trend needs historical health scoring
        anomaly_status=machine.status.value if machine.status.value != "offline" else "normal",
        is_simulated=True,
    )


def build_recommendations(sensors: list[Sensor]) -> list[RecommendationOut]:
    recs = []
    for sensor in sensors:
        if sensor.state == SensorState.FAULT:
            recs.append(RecommendationOut(
                title=f"Inspect {sensor.sensor_type.value} system",
                detail=f"{sensor.sensor_type.value.capitalize()} readings have crossed the configured critical threshold. Demo rule: recommend immediate inspection.",
                urgency="high",
            ))
        elif sensor.state == SensorState.WARNING:
            recs.append(RecommendationOut(
                title=f"Monitor {sensor.sensor_type.value} trend",
                detail=f"{sensor.sensor_type.value.capitalize()} readings are trending toward the warning threshold. Demo rule: suggest scheduling a check during the next maintenance window.",
                urgency="medium",
            ))

    if not recs:
        recs.append(RecommendationOut(
            title="No action required",
            detail="All monitored parameters are within normal configured ranges. Demo rule: routine preventive maintenance schedule applies.",
            urgency="low",
        ))
    return recs