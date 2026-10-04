import unittest

from fastapi.testclient import TestClient

from main import app
from services.ai_engine import analyze_city


class AIEngineTests(unittest.TestCase):
    def test_returns_stable_status_without_risks(self):
        analysis = analyze_city(
            {"congestion": "Moderate"},
            {"aqi": 98},
            {"riskLevel": "Low"},
            {"criticalAlerts": 0},
        )

        self.assertEqual(analysis["cityRiskScore"], 0)
        self.assertEqual(analysis["overallStatus"], "Stable")
        self.assertEqual(analysis["recommendations"], [])

    def test_normalizes_string_alert_counts_and_scores_risks(self):
        analysis = analyze_city(
            {"congestion": "Severe"},
            {"aqi": 151},
            {"riskLevel": "HIGH"},
            {"criticalAlerts": "03"},
        )

        self.assertEqual(analysis["cityRiskScore"], 100)
        self.assertEqual(analysis["overallStatus"], "Critical")
        self.assertEqual(len(analysis["recommendations"]), 4)


class AIRouteTests(unittest.TestCase):
    client = TestClient(app)

    def test_analysis_uses_the_current_route_data(self):
        response = self.client.get("/api/ai/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["cityRiskScore"], 55)
        self.assertEqual(payload["overallStatus"], "High Risk")
        self.assertEqual(payload["statusSummary"]["traffic"]["value"], "Moderate")
        self.assertEqual(payload["statusSummary"]["pollution"]["value"], "Moderate")
        self.assertGreater(len(payload["alerts"]), 0)

    def test_chat_uses_current_city_values(self):
        response = self.client.post("/api/ai/", json={"message": "What is the AQI?"})

        self.assertEqual(response.status_code, 200)
        self.assertIn("98", response.json()["response"])


if __name__ == "__main__":
    unittest.main()
