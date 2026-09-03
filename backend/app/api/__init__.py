from fastapi import APIRouter
from app.api import health, analytics, machines, auth, dashboard

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(analytics.router)
api_router.include_router(machines.router)
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)