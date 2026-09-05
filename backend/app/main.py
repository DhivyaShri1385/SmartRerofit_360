import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.config import settings
from app.database import Base, engine, SessionLocal
from app.api import api_router
from app.services.machine_seed import seed_demo_machines
from app.services.user_seed import seed_demo_users
from app.services.sensor_seed import seed_demo_sensors
from app.services.device_seed import seed_demo_devices
from app.services.simulation.engine import run_simulation_loop
from app.mqtt.consumer import start_mqtt_consumer

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_demo_machines(db)
    seed_demo_users(db)
    seed_demo_sensors(db)
    seed_demo_devices(db)
finally:
    db.close()

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(run_simulation_loop())
    start_mqtt_consumer()  # no-op today; logs and returns since MQTT_ENABLED=False