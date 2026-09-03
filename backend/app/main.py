from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.config import settings
from app.database import Base, engine, SessionLocal
from app.api import api_router
from app.services.machine_seed import seed_demo_machines
from app.services.user_seed import seed_demo_users

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_demo_machines(db)
    seed_demo_users(db)
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