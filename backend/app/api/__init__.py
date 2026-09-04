from fastapi import APIRouter
from app.api import health, analytics, machines, auth, dashboard, sensors, sensor_readings, simulation

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(analytics.router)
api_router.include_router(machines.router)
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(sensors.router)
api_router.include_router(sensor_readings.router)
api_router.include_router(simulation.router)