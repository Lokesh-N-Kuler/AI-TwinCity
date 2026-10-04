from fastapi import APIRouter, HTTPException
import httpx
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

router = APIRouter(
    prefix="/api/traffic",
    tags=["Traffic"]
)

LATITUDE = 12.9716
LONGITUDE = 77.5946


def get_congestion(current_speed, free_flow_speed):
    if not free_flow_speed or free_flow_speed <= 0:
        return "Unknown"

    ratio = current_speed / free_flow_speed

    if ratio >= 0.8:
        return "Low"
    elif ratio >= 0.5:
        return "Moderate"
    elif ratio >= 0.3:
        return "High"
    else:
        return "Severe"


@router.get("/")
async def get_traffic():

    api_key = os.getenv("TOMTOM_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="TOMTOM_API_KEY is not configured"
        )

    url = (
        "https://api.tomtom.com/traffic/services/4/"
        "flowSegmentData/absolute/10/json"
    )

    params = {
        "point": f"{LATITUDE},{LONGITUDE}",
        "unit": "KMPH",
        "key": api_key
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params)

        response.raise_for_status()

        data = response.json()

        print("TOMTOM RESPONSE:", data)

        flow = data.get("flowSegmentData", {})

        current_speed = flow.get("currentSpeed")
        free_flow_speed = flow.get("freeFlowSpeed")

        if current_speed is None:
            raise HTTPException(
                status_code=502,
                detail="TomTom did not return current traffic speed"
            )

        congestion = get_congestion(
            current_speed,
            free_flow_speed
        )

        return {
            "location": "Bengaluru",
            "congestion": congestion,
            "currentSpeed": current_speed,
            "freeFlowSpeed": free_flow_speed,
            "average_speed": current_speed,
            "active_vehicles": None,
            "high_congestion_areas": [],
            "confidence": flow.get("confidence"),
            "roadClosure": flow.get("roadClosure", False),
            "updatedAt": datetime.now().isoformat()
        }

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Traffic service unavailable: {error}"
        )