from fastapi import APIRouter
from app.utils.config import settings

router = APIRouter(prefix="/api", tags=["System"])


@router.get("/health")
def health_check():
    """Basic liveness + mode check consumed by the frontend connection indicator."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "simulation_mode": settings.SIMULATION_MODE,
        "mqtt_enabled": settings.MQTT_ENABLED,
    }