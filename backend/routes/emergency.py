from fastapi import APIRouter, HTTPException
import httpx
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/api/emergency",
    tags=["Emergency"]
)

LATITUDE = 12.9716
LONGITUDE = 77.5946


def get_severity(current_speed, free_flow_speed):
    if not free_flow_speed or free_flow_speed <= 0:
        return "Unknown"

    ratio = current_speed / free_flow_speed

    if ratio < 0.30:
        return "Critical"
    elif ratio < 0.50:
        return "High"
    elif ratio < 0.80:
        return "Medium"
    else:
        return "Low"


def get_incident_from_traffic(
    current_speed,
    free_flow_speed,
    road_closure
):
    severity = get_severity(
        current_speed,
        free_flow_speed
    )

    if road_closure:
        return {
            "id": "traffic-road-closure",
            "title": "Road Closure Detected",
            "type": "Road Closure",
            "location": "Bengaluru",
            "level": "Critical",
            "severity": "Critical",
            "status": "Active",
            "time": "Live",
            "source": "TomTom Traffic Flow"
        }

    if severity == "Critical":
        return {
            "id": "traffic-critical",
            "title": "Severe Traffic Condition",
            "type": "Traffic Congestion",
            "location": "Bengaluru",
            "level": "Critical",
            "severity": "Critical",
            "status": "Active",
            "time": "Live",
            "source": "TomTom Traffic Flow"
        }

    if severity == "High":
        return {
            "id": "traffic-high",
            "title": "High Traffic Congestion",
            "type": "Traffic Congestion",
            "location": "Bengaluru",
            "level": "High",
            "severity": "High",
            "status": "Monitoring",
            "time": "Live",
            "source": "TomTom Traffic Flow"
        }

    return None


@router.get("/")
async def get_emergency_data():

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
            response = await client.get(
                url,
                params=params
            )

        print(
            "TOMTOM EMERGENCY STATUS:",
            response.status_code
        )

        response.raise_for_status()

        data = response.json()

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=(
                "TomTom traffic service returned "
                f"HTTP {error.response.status_code}: "
                f"{error.response.text[:500]}"
            )
        )

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=(
                f"TomTom traffic service unavailable: {error}"
            )
        )

    flow = data.get("flowSegmentData", {})

    current_speed = flow.get("currentSpeed")
    free_flow_speed = flow.get("freeFlowSpeed")
    confidence = flow.get("confidence")
    road_closure = flow.get("roadClosure", False)

    if current_speed is None:
        raise HTTPException(
            status_code=502,
            detail=(
                "TomTom did not return current traffic speed"
            )
        )

    severity = get_severity(
        current_speed,
        free_flow_speed
    )

    incident = get_incident_from_traffic(
        current_speed,
        free_flow_speed,
        road_closure
    )

    incidents = []

    if incident:
        incidents.append(incident)

    critical_alerts = sum(
        1
        for item in incidents
        if item["severity"] == "Critical"
    )

    map_points = []

    if incident:
        map_points.append({
            "id": incident["id"],
            "label": incident["title"],
            "type": "incident",
            "position": "point-one",
            "latitude": LATITUDE,
            "longitude": LONGITUDE,
            "severity": incident["severity"]
        })

    if incident:
        ai_analysis = {
            "incident": incident["title"],
            "description": (
                "The current TomTom traffic feed indicates "
                f"a {incident['severity'].lower()} traffic condition "
                "in the monitored Bengaluru area."
            ),
            "priorityScore": (
                95
                if incident["severity"] == "Critical"
                else 75
                if incident["severity"] == "High"
                else 50
            ),
            "peopleAffected": "N/A",
            "recommendedTeams": "N/A",
            "actions": [
                "Verify the condition with the responsible emergency authority.",
                "Monitor the affected traffic segment continuously.",
                "Coordinate traffic management if the condition worsens."
            ]
        }
    else:
        ai_analysis = {
            "incident": "No active emergency condition detected",
            "description": (
                "The connected live traffic source is not "
                "currently reporting a road closure or high-severity "
                "traffic condition for the monitored Bengaluru point."
            ),
            "priorityScore": 0,
            "peopleAffected": "N/A",
            "recommendedTeams": "N/A",
            "actions": [
                "Continue monitoring the live traffic feed.",
                "Monitor for sudden changes in traffic speed.",
                "Check official disaster authorities for independent emergency alerts."
            ]
        }

    alerts = []

    if road_closure:
        alerts.append({
            "message": (
                "A road closure is currently reported "
                "by the live traffic source."
            ),
            "type": "critical",
            "time": "LIVE",
            "source": "TomTom Traffic Flow"
        })

    elif severity == "Critical":
        alerts.append({
            "message": (
                "Critical traffic conditions are currently "
                "detected in the monitored Bengaluru area."
            ),
            "type": "critical",
            "time": "LIVE",
            "source": "TomTom Traffic Flow"
        })

    elif severity == "High":
        alerts.append({
            "message": (
                "High traffic congestion is currently "
                "detected in the monitored Bengaluru area."
            ),
            "type": "warning",
            "time": "LIVE",
            "source": "TomTom Traffic Flow"
        })

    else:
        alerts.append({
            "message": (
                "No high-severity emergency traffic condition "
                "is currently detected."
            ),
            "type": "success",
            "time": "LIVE",
            "source": "TomTom Traffic Flow"
        })

    return {
        "location": "Bengaluru",

        "stats": {
            "activeIncidents": len(incidents),
            "criticalAlerts": critical_alerts,
            "responseTeams": None,
            "resolvedToday": None
        },

        "incidents": incidents,

        "responseTeams": None,

        "mapPoints": map_points,

        "traffic": {
            "currentSpeed": current_speed,
            "freeFlowSpeed": free_flow_speed,
            "confidence": confidence,
            "roadClosure": road_closure,
            "severity": severity
        },

        "aiAnalysis": ai_analysis,

        "alerts": alerts,

        "dataSources": [
            "TomTom Traffic Flow"
        ],

        "updatedAt": datetime.now().isoformat()
    }