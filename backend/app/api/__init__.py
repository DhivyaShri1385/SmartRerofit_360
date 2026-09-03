from fastapi import APIRouter
from app.api import health, analytics, machines

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(analytics.router)
api_router.include_router(machines.router)