from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(
    prefix="/api/pollution",
    tags=["Pollution"]
)

AREAS = [
    {
        "name": "Peenya Industrial Area",
        "latitude": 13.0329,
        "longitude": 77.5279
    },
    {
        "name": "Silk Board",
        "latitude": 12.9172,
        "longitude": 77.6227
    },
    {
        "name": "Whitefield",
        "latitude": 12.9698,
        "longitude": 77.7499
    },
    {
        "name": "Electronic City",
        "latitude": 12.8452,
        "longitude": 77.6602
    },
    {
        "name": "Indiranagar",
        "latitude": 12.9784,
        "longitude": 77.6408
    }
]

# Bengaluru + all monitored areas.
LOCATIONS = [
    {
        "name": "Bengaluru",
        "latitude": 12.9716,
        "longitude": 77.5946
    },
    *AREAS
]


def get_aqi_status(aqi):
    if aqi is None:
        return "No Data"

    if aqi <= 50:
        return "Good"

    if aqi <= 100:
        return "Moderate"

    if aqi <= 150:
        return "Unhealthy for Sensitive Groups"

    if aqi <= 200:
        return "Unhealthy"

    if aqi <= 300:
        return "Very Unhealthy"

    return "Hazardous"


def get_aqi_level(aqi):
    if aqi is None:
        return "no-data"

    if aqi <= 100:
        return "good"

    if aqi <= 150:
        return "moderate"

    return "high"


def safe_number(value):
    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


async def fetch_air_quality(client):
    url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    latitude = ",".join(
        str(location["latitude"])
        for location in LOCATIONS
    )

    longitude = ",".join(
        str(location["longitude"])
        for location in LOCATIONS
    )

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

    response = await client.get(
        url,
        params=params
    )

    response.raise_for_status()

    return response.json()


@router.get("/")
async def get_pollution():

    try:

        async with httpx.AsyncClient(
            timeout=20
        ) as client:

            data = await fetch_air_quality(client)

        # Open-Meteo returns a list when multiple
        # coordinates are requested.
        if not isinstance(data, list):
            data = [data]

        if not data:
            raise HTTPException(
                status_code=502,
                detail="No air quality data received."
            )

        main_data = data[0]

        current = main_data.get("current", {})
        hourly = main_data.get("hourly", {})

        current_aqi = safe_number(
            current.get("us_aqi")
        )

        if current_aqi is not None:
            current_aqi = int(round(current_aqi))

        # -----------------------------
        # Hourly AQI
        # -----------------------------

        hourly_aqi = []

        times = hourly.get("time", [])
        values = hourly.get("us_aqi", [])

        for time, value in zip(times, values):

            aqi = safe_number(value)

            if aqi is not None:
                hourly_aqi.append({
                    "time": time,
                    "aqi": int(round(aqi))
                })

        # -----------------------------
        # Area AQI
        # -----------------------------

        areas = []

        for index, area in enumerate(AREAS, start=1):

            if index >= len(data):
                areas.append({
                    "name": area["name"],
                    "aqi": None,
                    "status": "No Data",
                    "level": "no-data",
                    "latitude": area["latitude"],
                    "longitude": area["longitude"]
                })
                continue

            area_current = data[index].get(
                "current",
                {}
            )

            area_aqi = safe_number(
                area_current.get("us_aqi")
            )

            if area_aqi is not None:
                area_aqi = int(round(area_aqi))

            areas.append({
                "name": area["name"],
                "aqi": area_aqi,
                "status": get_aqi_status(area_aqi),
                "level": get_aqi_level(area_aqi),
                "latitude": area["latitude"],
                "longitude": area["longitude"]
            })

        # Highest AQI first.
        areas.sort(
            key=lambda item: (
                item["aqi"] is not None,
                item["aqi"] or -1
            ),
            reverse=True
        )

        return {
            "location": "Bengaluru",

            "aqi": current_aqi,

            "status": get_aqi_status(
                current_aqi
            ),

            "pollutants": {
                "pm2_5": safe_number(
                    current.get("pm2_5")
                ),
                "pm10": safe_number(
                    current.get("pm10")
                ),
                "carbonMonoxide": safe_number(
                    current.get("carbon_monoxide")
                ),
                "nitrogenDioxide": safe_number(
                    current.get("nitrogen_dioxide")
                ),
                "sulphurDioxide": safe_number(
                    current.get("sulphur_dioxide")
                ),
                "ozone": safe_number(
                    current.get("ozone")
                )
            },

            "hourly": hourly_aqi,

            "areas": areas,

            "updatedAt": current.get(
                "time"
            ),

            "unit": {
                "pm": "μg/m³",
                "gas": "μg/m³"
            }
        }

    except httpx.HTTPStatusError as error:

        print(
            "Air quality HTTP error:",
            error
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Air quality provider returned "
                f"HTTP {error.response.status_code}"
            )
        )

    except httpx.RequestError as error:

        print(
            "Air quality request error:",
            error
        )

        raise HTTPException(
            status_code=502,
            detail="Unable to connect to air quality provider."
        )

    except Exception as error:

        print(
            "Air quality unexpected error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=f"Pollution service error: {error}"
        )