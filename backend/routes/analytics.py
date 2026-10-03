import json
import os
from datetime import datetime
from statistics import mean

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter

load_dotenv()

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)

BENGALURU_LAT = 12.9716
BENGALURU_LON = 77.5946

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
HISTORY_FILE = os.path.join(DATA_DIR, "analytics_history.json")

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")


def ensure_history_file():
    os.makedirs(DATA_DIR, exist_ok=True)

    if not os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "w", encoding="utf-8") as file:
            json.dump([], file)


def load_history():
    ensure_history_file()

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)

        if isinstance(data, list):
            return data

    except Exception:
        pass

    return []


def save_history(history):
    ensure_history_file()

    with open(HISTORY_FILE, "w", encoding="utf-8") as file:
        json.dump(history[-168:], file, indent=2)


def get_current_minute():
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def calculate_sub_index(concentration, breakpoints):
    if concentration is None:
        return None

    try:
        concentration = float(concentration)
    except (TypeError, ValueError):
        return None

    if concentration < 0:
        return None

    for low, high, index_low, index_high in breakpoints:
        if low <= concentration <= high:
            if high == low:
                return index_high

            value = (
                ((index_high - index_low) / (high - low))
                * (concentration - low)
            ) + index_low

            return round(value)

    if concentration > breakpoints[-1][1]:
        return 500

    return None


CPCB_BREAKPOINTS = {
    "pm10": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (431, 1000, 401, 500),
    ],
    "pm2_5": [
        (0, 30, 0, 50),
        (31, 60, 51, 100),
        (61, 90, 101, 200),
        (91, 120, 201, 300),
        (121, 250, 301, 400),
        (251, 1000, 401, 500),
    ],
    "no2": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 180, 101, 200),
        (181, 280, 201, 300),
        (281, 400, 301, 400),
        (401, 1000, 401, 500),
    ],
    "o3": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 168, 101, 200),
        (169, 208, 201, 300),
        (209, 748, 301, 400),
        (749, 1500, 401, 500),
    ],
    "so2": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 380, 101, 200),
        (381, 800, 201, 300),
        (801, 1600, 301, 400),
        (1601, 3000, 401, 500),
    ],
    "nh3": [
        (0, 200, 0, 50),
        (201, 400, 51, 100),
        (401, 800, 101, 200),
        (801, 1200, 201, 300),
        (1201, 1800, 301, 400),
        (1801, 3000, 401, 500),
    ],
    "pb": [
        (0, 0.5, 0, 50),
        (0.51, 1.0, 51, 100),
        (1.01, 2.0, 101, 200),
        (2.01, 3.0, 201, 300),
        (3.01, 3.5, 301, 400),
        (3.51, 10, 401, 500),
    ],
    "co": [
        (0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 100.0, 401, 500),
    ],
}


def get_aqi_category(aqi):
    if aqi is None:
        return "Unavailable"

    if aqi <= 50:
        return "Good"

    if aqi <= 100:
        return "Satisfactory"

    if aqi <= 200:
        return "Moderately Polluted"

    if aqi <= 300:
        return "Poor"

    if aqi <= 400:
        return "Very Poor"

    return "Severe"


def calculate_indian_aqi(pollutants):
    sub_indices = {}

    for pollutant, value in pollutants.items():
        if value is None:
            continue

        breakpoints = CPCB_BREAKPOINTS.get(pollutant)

        if not breakpoints:
            continue

        index_value = calculate_sub_index(
            value,
            breakpoints
        )

        if index_value is not None:
            sub_indices[pollutant] = index_value

    required_pollutant_available = (
        "pm10" in sub_indices or "pm2_5" in sub_indices
    )

    if len(sub_indices) < 3 or not required_pollutant_available:
        return {
            "aqi": None,
            "category": "Insufficient Data",
            "dominantPollutant": None,
            "subIndices": sub_indices,
        }

    dominant_pollutant = max(
        sub_indices,
        key=sub_indices.get
    )

    aqi = min(
        500,
        sub_indices[dominant_pollutant]
    )

    return {
        "aqi": aqi,
        "category": get_aqi_category(aqi),
        "dominantPollutant": dominant_pollutant,
        "subIndices": sub_indices,
    }


async def get_air_quality():
    url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={BENGALURU_LAT}"
        f"&longitude={BENGALURU_LON}"
        "&hourly=pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,"
        "ozone,carbon_monoxide"
        "&past_hours=24"
        "&forecast_hours=1"
        "&timezone=Asia%2FKolkata"
    )

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url)
        response.raise_for_status()

        return response.json()


def average_recent(values, count):
    if not values:
        return None

    cleaned = []

    for value in values[-count:]:
        if value is not None:
            try:
                cleaned.append(float(value))
            except (TypeError, ValueError):
                pass

    if not cleaned:
        return None

    return mean(cleaned)


def extract_pollutants(data):
    hourly = data.get("hourly", {})

    pm10_values = hourly.get("pm10", [])
    pm25_values = hourly.get("pm2_5", [])
    no2_values = hourly.get("nitrogen_dioxide", [])
    so2_values = hourly.get("sulphur_dioxide", [])
    ozone_values = hourly.get("ozone", [])
    co_values = hourly.get("carbon_monoxide", [])

    ozone_average = average_recent(
        ozone_values,
        8
    )

    co_average = average_recent(
        co_values,
        8
    )

    return {
        "pm10": average_recent(
            pm10_values,
            24
        ),
        "pm2_5": average_recent(
            pm25_values,
            24
        ),
        "no2": average_recent(
            no2_values,
            24
        ),
        "so2": average_recent(
            so2_values,
            24
        ),
        "o3": ozone_average,
        "co": (
            co_average / 1000
            if co_average is not None
            else None
        ),
    }


async def get_traffic_data():
    if not TOMTOM_API_KEY:
        return {
            "currentSpeed": None,
            "freeFlowSpeed": None,
            "confidence": None,
            "roadClosure": None,
            "severity": "Unavailable",
        }

    url = (
        "https://api.tomtom.com/traffic/services/4/"
        "flowSegmentData/absolute/10/json"
    )

    params = {
        "point": f"{BENGALURU_LAT},{BENGALURU_LON}",
        "unit": "KMPH",
        "key": TOMTOM_API_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                url,
                params=params
            )

            response.raise_for_status()

            data = response.json()

        flow = data.get(
            "flowSegmentData",
            {}
        )

        current_speed = flow.get(
            "currentSpeed"
        )

        free_flow_speed = flow.get(
            "freeFlowSpeed"
        )

        if free_flow_speed is None:
            free_flow_speed = flow.get(
                "freeFlow"
            )

        confidence = flow.get(
            "confidence"
        )

        road_closure = flow.get(
            "roadClosure"
        )

        severity = "Unavailable"

        if (
            current_speed is not None
            and free_flow_speed is not None
            and free_flow_speed > 0
        ):
            ratio = (
                current_speed /
                free_flow_speed
            )

            if ratio >= 0.85:
                severity = "Low"
            elif ratio >= 0.65:
                severity = "Medium"
            elif ratio >= 0.45:
                severity = "High"
            else:
                severity = "Severe"

        return {
            "currentSpeed": current_speed,
            "freeFlowSpeed": free_flow_speed,
            "confidence": confidence,
            "roadClosure": road_closure,
            "severity": severity,
        }

    except Exception as error:
        print(
            "Analytics traffic error:",
            error
        )

        return {
            "currentSpeed": None,
            "freeFlowSpeed": None,
            "confidence": None,
            "roadClosure": None,
            "severity": "Unavailable",
        }


async def get_emergency_data():
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                "http://127.0.0.1:8000/api/emergency/"
            )

            if response.status_code != 200:
                return None

            return response.json()

    except Exception as error:
        print(
            "Analytics emergency error:",
            error
        )

        return None


async def get_flood_data():
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                "http://127.0.0.1:8000/api/flood/"
            )

            if response.status_code != 200:
                print(
                    "Analytics flood status:",
                    response.status_code
                )
                return None

            return response.json()

    except Exception as error:
        print(
            "Analytics flood error:",
            error
        )

        return None


def find_flood_risk(data):
    if not isinstance(data, dict):
        return None

    possible_keys = [
        "riskLevel",
        "risk",
        "floodRisk",
        "risk_level",
        "flood_risk"
    ]

    for key in possible_keys:
        value = data.get(key)

        if isinstance(value, str):
            return value

    prediction = data.get("prediction")

    if isinstance(prediction, dict):
        for key in possible_keys:
            value = prediction.get(key)

            if isinstance(value, str):
                return value

    result = data.get("result")

    if isinstance(result, dict):
        for key in possible_keys:
            value = result.get(key)

            if isinstance(value, str):
                return value

    return None


def calculate_flood_indicator(flood_data):
    risk = find_flood_risk(
        flood_data
    )

    if risk is None:
        return {
            "score": None,
            "status": "Unavailable",
            "riskLevel": None,
        }

    normalized = risk.strip().lower()

    if normalized in ["low", "safe", "normal"]:
        score = 100

    elif normalized in [
        "moderate",
        "medium",
        "moderate risk"
    ]:
        score = 75

    elif normalized in [
        "high",
        "high risk"
    ]:
        score = 50

    elif normalized in [
        "critical",
        "severe",
        "very high"
    ]:
        score = 25

    else:
        return {
            "score": None,
            "status": risk,
            "riskLevel": risk,
        }

    return {
        "score": score,
        "status": risk,
        "riskLevel": risk,
    }


def calculate_emergency_indicator(emergency):
    if not emergency:
        return {
            "score": None,
            "status": "Unavailable",
        }

    stats = emergency.get(
        "stats",
        {}
    )

    active_incidents = stats.get(
        "activeIncidents"
    )

    critical_alerts = stats.get(
        "criticalAlerts"
    )

    if not isinstance(
        active_incidents,
        (int, float)
    ):
        return {
            "score": None,
            "status": "Unavailable",
        }

    if not isinstance(
        critical_alerts,
        (int, float)
    ):
        critical_alerts = 0

    score = (
        100
        - (active_incidents * 5)
        - (critical_alerts * 20)
    )

    score = max(
        0,
        min(
            100,
            score
        )
    )

    score = round(score)

    if critical_alerts > 0:
        status = "Critical Alerts Active"

    elif active_incidents > 0:
        status = "Incidents Active"

    else:
        status = "No Active Incidents"

    return {
        "score": score,
        "status": status,
    }


def calculate_traffic_efficiency(traffic):
    current = traffic.get(
        "currentSpeed"
    )

    free_flow = traffic.get(
        "freeFlowSpeed"
    )

    if (
        current is None
        or free_flow in (None, 0)
    ):
        return None

    efficiency = (
        current /
        free_flow
    ) * 100

    return round(
        max(
            0,
            min(
                100,
                efficiency
            )
        )
    )


def get_emergency_count(emergency):
    if not emergency:
        return None

    stats = emergency.get(
        "stats",
        {}
    )

    value = stats.get(
        "activeIncidents"
    )

    if isinstance(
        value,
        (int, float)
    ):
        return value

    return None


def create_snapshot(
    history,
    traffic,
    aqi_result,
    emergency,
):
    minute = get_current_minute()

    if history:
        last_timestamp = history[-1].get(
            "timestamp",
            ""
        )

        if last_timestamp.startswith(
            minute
        ):
            return history

    traffic_efficiency = (
        calculate_traffic_efficiency(
            traffic
        )
    )

    snapshot = {
        "timestamp": datetime.now().isoformat(),
        "day": datetime.now().strftime(
            "%H:%M"
        ),
        "traffic": traffic_efficiency,
        "pollution": (
            aqi_result["aqi"]
            if aqi_result["aqi"] is not None
            else None
        ),
        "emergency": get_emergency_count(
            emergency
        ),
    }

    history.append(
        snapshot
    )

    return history[-168:]


def create_insights(
    traffic,
    aqi_result,
    pollutants,
    emergency,
    history,
    flood_indicator,
    emergency_indicator,
):
    insights = []

    current_speed = traffic.get(
        "currentSpeed"
    )

    free_flow_speed = traffic.get(
        "freeFlowSpeed"
    )

    if (
        current_speed is not None
        and free_flow_speed is not None
    ):
        severity = traffic.get(
            "severity"
        )

        if severity == "Severe":
            insights.append(
                "Traffic flow is currently severely reduced compared with free-flow speed."
            )

        elif severity == "High":
            insights.append(
                "Traffic flow is currently significantly below free-flow speed."
            )

        elif severity == "Medium":
            insights.append(
                "Traffic flow is moderately below free-flow speed."
            )

        else:
            insights.append(
                "Traffic flow is currently close to the measured free-flow speed."
            )

    else:
        insights.append(
            "Current traffic efficiency is unavailable because free-flow speed was not returned by the traffic source."
        )

    if aqi_result["aqi"] is not None:
        insights.append(
            f"Indian AQI is {aqi_result['aqi']} "
            f"({aqi_result['category']})."
        )

        if aqi_result["dominantPollutant"]:
            insights.append(
                "The dominant AQI pollutant is "
                f"{aqi_result['dominantPollutant'].upper()}."
            )

    else:
        insights.append(
            "Indian AQI is unavailable because the available pollutant data "
            "does not satisfy the CPCB minimum-data rule."
        )

    emergency_count = get_emergency_count(
        emergency
    )

    if emergency_count is not None:
        insights.append(
            "The emergency monitoring endpoint currently reports "
            f"{emergency_count} active incident(s)."
        )

    else:
        insights.append(
            "Current emergency incident data is unavailable."
        )

    if flood_indicator["score"] is not None:
        insights.append(
            "Flood monitoring currently reports "
            f"{flood_indicator['status']} risk."
        )

    else:
        insights.append(
            "Current flood monitoring data is unavailable."
        )

    if emergency_indicator["score"] is not None:
        insights.append(
            "Emergency response monitoring currently reports "
            f"{emergency_indicator['status']}."
        )

    insights.append(
        f"Historical analytics snapshots collected: {len(history)}."
    )

    return insights


@router.get("/")
async def analytics():
    air_quality = await get_air_quality()

    pollutants = extract_pollutants(
        air_quality
    )

    aqi_result = calculate_indian_aqi(
        pollutants
    )

    traffic = await get_traffic_data()

    emergency = await get_emergency_data()

    flood_data = await get_flood_data()

    flood_indicator = calculate_flood_indicator(
        flood_data
    )

    emergency_indicator = calculate_emergency_indicator(
        emergency
    )

    history = load_history()

    history = create_snapshot(
        history,
        traffic,
        aqi_result,
        emergency,
    )

    save_history(
        history
    )

    traffic_efficiency = (
        calculate_traffic_efficiency(
            traffic
        )
    )

    return {
        "location": "Bengaluru",

        "stats": {
            "indianAQI": aqi_result["aqi"],
            "aqiCategory": aqi_result["category"],
            "dominantPollutant": aqi_result["dominantPollutant"],
            "trafficEfficiency": traffic_efficiency,
            "emergencyResponseTime": None,
        },

        "airQuality": {
            "pollutants": pollutants,
            "subIndices": aqi_result["subIndices"],
            "indianAQI": aqi_result["aqi"],
            "category": aqi_result["category"],
            "dominantPollutant": aqi_result["dominantPollutant"],
            "method": "CPCB National AQI methodology",
            "source": "Open-Meteo CAMS model data",
        },

        "traffic": traffic,

        "flood": {
            "riskLevel": flood_indicator["riskLevel"],
            "score": flood_indicator["score"],
            "status": flood_indicator["status"],
            "source": "CityTwin Flood API",
        },

        "emergency": {
            "activeIncidents": get_emergency_count(
                emergency
            ),
            "criticalAlerts": (
                emergency.get(
                    "stats",
                    {}
                ).get(
                    "criticalAlerts"
                )
                if emergency
                else None
            ),
            "source": "CityTwin Emergency API",
        },

        "performanceHistory": history,

        "departments": {
            "traffic": {
                "score": traffic_efficiency,
                "status": (
                    traffic.get("severity")
                    if traffic_efficiency is not None
                    else "Unavailable"
                ),
            },

            "airQuality": {
                "score": aqi_result["aqi"],
                "status": aqi_result["category"],
            },

            "flood": {
                "score": flood_indicator["score"],
                "status": flood_indicator["status"],
            },

            "emergency": {
                "score": emergency_indicator["score"],
                "status": emergency_indicator["status"],
            },
        },

        "insights": create_insights(
            traffic,
            aqi_result,
            pollutants,
            emergency,
            history,
            flood_indicator,
            emergency_indicator,
        ),

        "updatedAt": datetime.now().isoformat(),
    }