from fastapi import APIRouter, HTTPException
import httpx
import asyncio

router = APIRouter(
    prefix="/api/pollution",
    tags=["Pollution"]
)

# Bengaluru center
LATITUDE = 12.9716
LONGITUDE = 77.5946


AREAS = {
    "Peenya Industrial Area": {
        "latitude": 13.0329,
        "longitude": 77.5279
    },
    "Silk Board": {
        "latitude": 12.9172,
        "longitude": 77.6227
    },
    "Whitefield": {
        "latitude": 12.9698,
        "longitude": 77.7499
    },
    "Electronic City": {
        "latitude": 12.8452,
        "longitude": 77.6602
    },
    "Indiranagar": {
        "latitude": 12.9784,
        "longitude": 77.6408
    }
}


def get_aqi_status(aqi: int) -> str:

    if aqi <= 50:
        return "Good"

    elif aqi <= 100:
        return "Moderate"

    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"

    elif aqi <= 200:
        return "Unhealthy"

    elif aqi <= 300:
        return "Very Unhealthy"

    return "Hazardous"


async def fetch_air_quality(
    client: httpx.AsyncClient,
    latitude: float,
    longitude: float
):

    url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": ",".join([
            "us_aqi",
            "pm2_5",
            "pm10",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone"
        ]),

        "hourly": "us_aqi",

        "forecast_days": 1,

        "timezone": "Asia/Kolkata"
    }

    response = await client.get(url, params=params)

    response.raise_for_status()

    return response.json()


@router.get("/")
async def get_pollution():

    try:

        async with httpx.AsyncClient(timeout=15) as client:

            # Main Bengaluru location
            data = await fetch_air_quality(
                client,
                LATITUDE,
                LONGITUDE
            )

            # Fetch all areas simultaneously
            area_tasks = [
                fetch_air_quality(
                    client,
                    area["latitude"],
                    area["longitude"]
                )
                for area in AREAS.values()
            ]

            area_results = await asyncio.gather(*area_tasks)

        current = data["current"]
        hourly = data["hourly"]

        current_aqi = int(current["us_aqi"])

        # -----------------------------
        # Hourly AQI
        # -----------------------------

        hourly_aqi = []

        for time, aqi in zip(
            hourly["time"],
            hourly["us_aqi"]
        ):

            if aqi is not None:

                hourly_aqi.append({
                    "time": time,
                    "aqi": int(aqi)
                })

        # -----------------------------
        # Area AQI
        # -----------------------------

        areas = []

        for (name, location), area_data in zip(
            AREAS.items(),
            area_results
        ):

            area_current = area_data["current"]

            area_aqi = int(area_current["us_aqi"])

            areas.append({
                "name": name,
                "aqi": area_aqi,
                "status": get_aqi_status(area_aqi),
                "level": (
                    "good"
                    if area_aqi <= 100
                    else "moderate"
                    if area_aqi <= 150
                    else "high"
                ),
                "latitude": location["latitude"],
                "longitude": location["longitude"]
            })

        # Highest AQI first
        areas.sort(
            key=lambda item: item["aqi"],
            reverse=True
        )

        return {
            "location": "Bengaluru",

            "aqi": current_aqi,

            "status": get_aqi_status(current_aqi),

            "pollutants": {
                "pm2_5": current["pm2_5"],
                "pm10": current["pm10"],
                "carbonMonoxide": current["carbon_monoxide"],
                "nitrogenDioxide": current["nitrogen_dioxide"],
                "sulphurDioxide": current["sulphur_dioxide"],
                "ozone": current["ozone"]
            },

            "hourly": hourly_aqi,

            "areas": areas,

            "updatedAt": current["time"],

            "unit": {
                "pm": "μg/m³",
                "gas": "μg/m³"
            }
        }

    except httpx.HTTPError as error:

        raise HTTPException(
            status_code=502,
            detail=f"Air quality service unavailable: {error}"
        )