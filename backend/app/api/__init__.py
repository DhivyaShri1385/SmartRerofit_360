from fastapi import APIRouter
from app.api import (
    health, analytics, machines, auth, dashboard,
    sensors, sensor_readings, simulation, live_monitoring, alerts,
    predictive_maintenance, energy, maintenance,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(analytics.router)
api_router.include_router(machines.router)
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(sensors.router)
api_router.include_router(sensor_readings.router)
api_router.include_router(simulation.router)
api_router.include_router(live_monitoring.router)
api_router.include_router(alerts.router)
api_router.include_router(predictive_maintenance.router)
api_router.include_router(energy.router)
api_router.include_router(maintenance.router)