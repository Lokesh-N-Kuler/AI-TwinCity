from fastapi import APIRouter, HTTPException
import httpx
from datetime import datetime

router = APIRouter(
    prefix="/api/flood",
    tags=["Flood"]
)

WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood"

MONITORING_POINTS = [
    {
        "name": "Bengaluru Central",
        "latitude": 12.9716,
        "longitude": 77.5946
    },
    {
        "name": "Bellandur",
        "latitude": 12.9304,
        "longitude": 77.6784
    },
    {
        "name": "Whitefield",
        "latitude": 12.9698,
        "longitude": 77.7500
    },
    {
        "name": "Koramangala",
        "latitude": 12.9352,
        "longitude": 77.6245
    },
    {
        "name": "HSR Layout",
        "latitude": 12.9116,
        "longitude": 77.6474
    },
    {
        "name": "Yelahanka",
        "latitude": 13.1007,
        "longitude": 77.5963
    },
    {
        "name": "Marathahalli",
        "latitude": 12.9591,
        "longitude": 77.6974
    },
    {
        "name": "Hebbal",
        "latitude": 13.0358,
        "longitude": 77.5970
    }
]


def rainfall_score(rainfall):
    rainfall = float(rainfall or 0)

    if rainfall >= 50:
        return 80
    if rainfall >= 25:
        return 55
    if rainfall >= 10:
        return 30

    return 10


def discharge_score(current_discharge, baseline_discharge):
    if current_discharge is None or baseline_discharge is None:
        return 0

    current_discharge = float(current_discharge)
    baseline_discharge = float(baseline_discharge)

    if baseline_discharge <= 0:
        return 0

    ratio = current_discharge / baseline_discharge

    if ratio >= 2.0:
        return 80

    if ratio >= 1.5:
        return 60

    if ratio >= 1.2:
        return 40

    if ratio >= 1.0:
        return 20

    return 0


def risk_from_score(score):
    if score >= 70:
        return "High"

    if score >= 45:
        return "Moderate"

    if score >= 25:
        return "Low"

    return "Very Low"


def risk_color(risk):
    if risk == "High":
        return "#dc2626"

    if risk == "Moderate":
        return "#f59e0b"

    if risk == "Low":
        return "#eab308"

    return "#16a34a"


async def get_weather(client, latitude, longitude):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "precipitation,rain",
        "hourly": "precipitation,rain",
        "forecast_days": 1,
        "timezone": "Asia/Kolkata"
    }

    response = await client.get(
        WEATHER_URL,
        params=params
    )

    response.raise_for_status()

    return response.json()


async def get_discharge(client, latitude, longitude):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "river_discharge",
        "past_days": 30,
        "forecast_days": 7,
        "timezone": "Asia/Kolkata"
    }

    response = await client.get(
        FLOOD_URL,
        params=params
    )

    response.raise_for_status()

    return response.json()


def calculate_baseline(values):
    valid_values = []

    for value in values:
        if value is not None:
            try:
                number = float(value)

                if number >= 0:
                    valid_values.append(number)
            except (ValueError, TypeError):
                continue

    if not valid_values:
        return None

    return sum(valid_values) / len(valid_values)


def build_chart_data(weather_data, discharge_data):
    weather_hourly = weather_data.get("hourly", {})

    weather_times = weather_hourly.get("time", [])
    rainfall_values = weather_hourly.get("precipitation", [])

    discharge_daily = discharge_data.get("daily", {})

    discharge_times = discharge_daily.get("time", [])
    discharge_values = discharge_daily.get("river_discharge", [])

    discharge_lookup = {}

    for date, value in zip(discharge_times, discharge_values):
        if value is not None:
            discharge_lookup[date] = value

    chart_data = []

    for time, rainfall in zip(weather_times, rainfall_values):
        if rainfall is None:
            continue

        date = time[:10]

        chart_data.append(
            {
                "time": time,
                "rainfall": float(rainfall),
                "river_discharge": discharge_lookup.get(date)
            }
        )

    return chart_data


@router.get("/")
async def get_flood_data():

    try:
        async with httpx.AsyncClient(timeout=20) as client:

            central_weather = await get_weather(
                client,
                12.9716,
                77.5946
            )
            central_flood = await get_discharge(
                client,
                12.9716,
                77.5946
            )

            current = central_weather.get("current", {})

            central_rainfall = float(
                current.get("precipitation", 0) or 0
            )

            monitoring_results = []

            for point in MONITORING_POINTS:

                try:
                    weather_data = await get_weather(
                        client,
                        point["latitude"],
                        point["longitude"]
                    )

                    flood_data = await get_discharge(
                        client,
                        point["latitude"],
                        point["longitude"]
                    )

                    weather_current = weather_data.get(
                        "current",
                        {}
                    )

                    rainfall = float(
                        weather_current.get(
                            "precipitation",
                            0
                        ) or 0
                    )

                    daily = flood_data.get(
                        "daily",
                        {}
                    )

                    discharge_values = daily.get(
                        "river_discharge",
                        []
                    )

                    valid_discharge = []

                    for value in discharge_values:
                        if value is not None:
                            try:
                                number = float(value)

                                if number >= 0:
                                    valid_discharge.append(number)

                            except (ValueError, TypeError):
                                pass

                    current_discharge = None

                    if valid_discharge:
                        current_discharge = valid_discharge[-1]

                    historical_values = valid_discharge[:-7]

                    baseline = calculate_baseline(
                        historical_values
                    )

                    rain_score = rainfall_score(
                        rainfall
                    )

                    river_score = discharge_score(
                        current_discharge,
                        baseline
                    )

                    combined_score = round(
                        (rain_score * 0.6) +
                        (river_score * 0.4)
                    )

                    risk = risk_from_score(
                        combined_score
                    )

                    monitoring_results.append(
                        {
                            "name": point["name"],
                            "latitude": point["latitude"],
                            "longitude": point["longitude"],
                            "rainfall": rainfall,
                            "river_discharge": current_discharge,
                            "baseline_discharge": baseline,
                            "rainfall_score": rain_score,
                            "river_score": river_score,
                            "risk_score": combined_score,
                            "risk_level": risk,
                            "color": risk_color(risk)
                        }
                    )

                except Exception as error:

                    print(
                        f"Flood monitoring error for "
                        f"{point['name']}: {error}"
                    )

                    monitoring_results.append(
                        {
                            "name": point["name"],
                            "latitude": point["latitude"],
                            "longitude": point["longitude"],
                            "rainfall": None,
                            "river_discharge": None,
                            "baseline_discharge": None,
                            "rainfall_score": 0,
                            "river_score": 0,
                            "risk_score": 0,
                            "risk_level": "No Data",
                            "color": "#6b7280"
                        }
                    )

            usable_points = [
                point
                for point in monitoring_results
                if point["risk_level"] != "No Data"
            ]

            if usable_points:

                highest_risk = max(
                    usable_points,
                    key=lambda item: item["risk_score"]
                )

                city_score = round(
                    sum(
                        point["risk_score"]
                        for point in usable_points
                    ) / len(usable_points)
                )

            else:

                highest_risk = {
                    "name": "Bengaluru",
                    "risk_level": "No Data",
                    "risk_score": 0,
                    "rainfall": central_rainfall,
                    "river_discharge": None
                }

                city_score = 0

            city_risk = risk_from_score(
                city_score
            )

            risk_areas = [
                point
                for point in monitoring_results
                if point["risk_score"] >= 25
            ]

            alerts = []

            for point in monitoring_results:

                if point["risk_level"] == "High":

                    alerts.append(
                        {
                            "type": "High Risk",
                            "severity": "high",
                            "area": point["name"],
                            "message": (
                                f"High flood-risk conditions "
                                f"detected around {point['name']}."
                            ),
                            "risk_score": point["risk_score"]
                        }
                    )

                elif point["risk_level"] == "Moderate":

                    alerts.append(
                        {
                            "type": "Flood Watch",
                            "severity": "moderate",
                            "area": point["name"],
                            "message": (
                                f"Moderate flood-risk conditions "
                                f"detected around {point['name']}."
                            ),
                            "risk_score": point["risk_score"]
                        }
                    )

            prediction = {
                "area": highest_risk["name"],
                "risk_level": highest_risk["risk_level"],
                "risk_score": highest_risk["risk_score"],
                "rainfall": highest_risk.get("rainfall"),
                "river_discharge": highest_risk.get(
                    "river_discharge"
                ),
                "message": (
                    f"{highest_risk['name']} currently has "
                    f"the highest modelled flood-risk score "
                    f"among the monitored locations."
                )
            }

            central_discharge = None

            central_point = next(
                (
                    point
                    for point in monitoring_results
                    if point["name"] == "Bengaluru Central"
                ),
                None
            )

            if central_point:
                central_discharge = central_point.get(
                    "river_discharge"
                )

            chart_data = build_chart_data(
                central_weather,
                central_flood
            )

            return {
                "location": "Bengaluru",

                "risk_level": city_risk,
                "riskLevel": city_risk,

                "risk_score": city_score,

                "affected_areas": len(risk_areas),

                "rainfall": central_rainfall,

                "river_discharge": central_discharge,

                "water_level": None,

                "water_level_source": None,

                "risk_areas": risk_areas,

                "map_locations": monitoring_results,

                "monitoring_points": monitoring_results,

                "chart_data": chart_data,

                "alerts": alerts,

                "prediction": prediction,

                "data_sources": {
                    "weather": "Open-Meteo Weather API",
                    "river_discharge": "GloFAS v4 via Open-Meteo Flood API"
                },

                "updatedAt": current.get(
                    "time",
                    datetime.now().isoformat()
                )
            }

    except httpx.HTTPStatusError as error:

        print(
            "Flood API HTTP error:",
            error
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Flood data provider returned "
                f"HTTP {error.response.status_code}"
            )
        )

    except httpx.RequestError as error:

        print(
            "Flood API request error:",
            error
        )

        raise HTTPException(
            status_code=502,
            detail="Unable to connect to flood data provider."
        )

    except Exception as error:

        print(
            "Flood API unexpected error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=f"Flood service error: {error}"
        )