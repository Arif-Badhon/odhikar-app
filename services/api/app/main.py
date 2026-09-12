from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

import os
from app.database import init_db, close_db
from app.routers import intake, report, knowledge, cases, training, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("uploads", exist_ok=True)
    await init_db()
    yield
    await close_db()

app = FastAPI(
    title="Odhikar Legal AI Platform API",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intake.router)
app.include_router(report.router)
app.include_router(knowledge.router)
app.include_router(cases.router)
app.include_router(training.router)
app.include_router(auth.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Odhikar API"}