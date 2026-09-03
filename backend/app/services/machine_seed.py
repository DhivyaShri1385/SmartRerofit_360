"""
Seeds the 3 demo machines on startup if they don't already exist.
These are configuration/demo entries for UI development —
NOT records of installed physical hardware.
"""
from sqlalchemy.orm import Session
from app.models.machine import Machine

DEMO_MACHINES = [
    {"name": "Lathe-01", "machine_type": "Lathe", "location": "Bay 1", "sensor_count": 5},
    {"name": "Drilling-01", "machine_type": "Drilling Machine", "location": "Bay 2", "sensor_count": 5},
    {"name": "Milling-01", "machine_type": "Milling Machine", "location": "Bay 3", "sensor_count": 5},
]


def seed_demo_machines(db: Session) -> None:
    for demo in DEMO_MACHINES:
        exists = db.query(Machine).filter(Machine.name == demo["name"]).first()
        if not exists:
            db.add(Machine(**demo, is_demo=True))
    db.commit()