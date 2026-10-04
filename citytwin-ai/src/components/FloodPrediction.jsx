import { useEffect, useState } from "react";
import { getFloodData } from "../services/FloodService";

function FloodPrediction() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadFloodPrediction() {
      try {
        const result = await getFloodData();
        setData(result);
      } catch (error) {
        console.error("Flood prediction error:", error);
      }
    }

    loadFloodPrediction();
  }, []);

  if (!data) {
    return (
      <div className="flood-prediction-card">
        Loading flood risk assessment...
      </div>
    );
  }

  const riskScore = Number(data.risk_score) || 0;

  let assessment = "Low flood risk";

  if (riskScore >= 70) {
    assessment = "High flood risk";
  } else if (riskScore >= 40) {
    assessment = "Moderate flood risk";
  }

  return (
    <div className="flood-prediction-card">

      <div className="prediction-header">

        <div>
          <h2>Flood Risk Assessment</h2>

          <p>
            Current flood-risk assessment from the backend
          </p>
        </div>

        <span className="ai-status">
          LIVE ANALYSIS
        </span>

      </div>

      <div className="prediction-content">

        <div className="prediction-main">

          <p className="prediction-label">
            CURRENT RISK LEVEL
          </p>

          <h3>{data.riskLevel}</h3>

          <p className="prediction-text">
            The flood monitoring system currently reports a{" "}
            <strong>{data.riskLevel}</strong> risk level for{" "}
            <strong>{data.location}</strong>.
            The current risk score is {riskScore} out of 100.
          </p>

          <div className="prediction-details">

            <div className="prediction-item">
              <span>Risk Score</span>
              <strong>
                {riskScore}/100
              </strong>
            </div>

            <div className="prediction-item">
              <span>Rainfall</span>
              <strong>
                {data.rainfall} mm
              </strong>
            </div>

            <div className="prediction-item">
              <span>Affected Areas</span>
              <strong>
                {data.affected_areas}
              </strong>
            </div>

          </div>

        </div>

        <div className="recommendation-box">

          <h3>Current Assessment</h3>

          <ul>
            <li>
              {assessment}
            </li>

            <li>
              Monitoring location: {data.location}
            </li>

            <li>
              Last updated:{" "}
              {data.updatedAt
                ? new Date(data.updatedAt).toLocaleString()
                : "Unavailable"}
            </li>
          </ul>

        </div>

      </div>

    </div>
  );
}

export default FloodPrediction;