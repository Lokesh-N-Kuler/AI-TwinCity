from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.traffic import router as traffic_router
from routes.pollution import router as pollution_router
from routes.flood import router as flood_router
from routes.emergency import router as emergency_router
from routes.weather import router as weather_router
from routes.analytics import router as analytics_router
from routes.dashboard import router as dashboard_router
from routes.ai import router as ai_router


app = FastAPI(
    title="City Pilot AI Backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(traffic_router)
app.include_router(pollution_router)
app.include_router(flood_router)
app.include_router(emergency_router)
app.include_router(weather_router)
app.include_router(analytics_router)
app.include_router(dashboard_router)
app.include_router(ai_router)


@app.get("/")
def home():
    return {
        "message": "City Pilot AI Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }