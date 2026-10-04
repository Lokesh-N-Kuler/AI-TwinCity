from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"]
)

# Bengaluru coordinates
LATITUDE = 12.9716
LONGITUDE = 77.5946


@router.get("/")
async def get_weather():
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m"
        ]),
        "timezone": "Asia/Kolkata"
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params)

        response.raise_for_status()
        data = response.json()

        current = data["current"]

        return {
            "location": "Bengaluru",
            "temperature": current["temperature_2m"],
            "feelsLike": current["apparent_temperature"],
            "humidity": current["relative_humidity_2m"],
            "windSpeed": current["wind_speed_10m"],
            "weatherCode": current["weather_code"],
            "updatedAt": current["time"],
            "unit": {
                "temperature": "°C",
                "windSpeed": "km/h"
            }
        }

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Weather service unavailable: {error}"
        )