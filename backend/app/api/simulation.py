"""
Control endpoints for the simulation engine — visible in Settings/System
Info later. Admin-only, since pausing simulation affects every user's view.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.simulation.engine import is_running, set_running, SIMULATION_INTERVAL_SECONDS
from app.api.dependencies import require_role

router = APIRouter(prefix="/api/simulation", tags=["Simulation Engine"])


class SimulationStatus(BaseModel):
    running: bool
    interval_seconds: int
    data_source: str = "simulated"


@router.get("/status", response_model=SimulationStatus)
def get_status():
    return SimulationStatus(running=is_running(), interval_seconds=SIMULATION_INTERVAL_SECONDS)


@router.post("/pause", response_model=SimulationStatus)
def pause_simulation(_: object = Depends(require_role("admin"))):
    set_running(False)
    return SimulationStatus(running=is_running(), interval_seconds=SIMULATION_INTERVAL_SECONDS)


@router.post("/resume", response_model=SimulationStatus)
def resume_simulation(_: object = Depends(require_role("admin"))):
    set_running(True)
    return SimulationStatus(running=is_running(), interval_seconds=SIMULATION_INTERVAL_SECONDS)