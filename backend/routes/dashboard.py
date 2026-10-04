from fastapi import APIRouter

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard():
    return {
        "city": "Bengaluru",

        "summary": {
            "traffic_status": "Moderate",
            "average_speed": 32,
            "aqi": 68,
            "aqi_status": "Moderate",
            "flood_risk": "Low",
            "active_emergencies": 12
        },

        "alerts": [
            {
                "type": "Traffic",
                "message": "Heavy congestion detected near Silk Board Junction"
            },
            {
                "type": "Pollution",
                "message": "AQI levels are rising in Whitefield"
            },
            {
                "type": "Emergency",
                "message": "Active road accident response in Bellandur"
            }
        ],

        "city_score": 82
    }