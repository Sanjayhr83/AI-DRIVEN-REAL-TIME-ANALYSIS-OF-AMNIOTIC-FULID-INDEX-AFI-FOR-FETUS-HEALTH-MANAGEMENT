from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import (
    auth,
    prediction,
    history,
    patients,
    appointments,
    doctors,
    external,
    health_records,
    medical_history,
    settings,
    setup,
)
from app.utils.database import connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect_to_mongo()
    except Exception as e:
        print(f"[WARNING] Starting without database: {e}")
    yield
    await close_mongo_connection()


app = FastAPI(title="Amniotic Fluid Analysis API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(prediction.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
# AFI chatbot router removed (was causing import errors when deleted)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(external.router)
app.include_router(health_records.router)
app.include_router(medical_history.router)
app.include_router(settings.router)
app.include_router(setup.router)
