import { useEffect, useState } from "react";
import "../styles/aiRecommendation.css";

function AIRecommendation() {
  const [traffic, setTraffic] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchTrafficData() {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/emergency/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch traffic data");
      }

      const data = await response.json();

      if (data.traffic) {
        setTraffic(data.traffic);
      }
    } catch (error) {
      console.error(
        "AI recommendation error:",
        error
      );

      setTraffic(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrafficData();

    const interval = setInterval(
      fetchTrafficData,
      60000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  function getPrediction() {
    if (!traffic) {
      return "Traffic data is currently unavailable.";
    }

    const currentSpeed = Number(
      traffic.currentSpeed
    );

    const freeFlowSpeed = Number(
      traffic.freeFlowSpeed
    );

    if (
      Number.isNaN(currentSpeed) ||
      Number.isNaN(freeFlowSpeed) ||
      freeFlowSpeed <= 0
    ) {
      return "Traffic conditions are being monitored.";
    }

    const speedRatio =
      currentSpeed / freeFlowSpeed;

    if (speedRatio < 0.5) {
      return "Heavy traffic congestion is currently detected.";
    }

    if (speedRatio < 0.75) {
      return "Moderate traffic congestion is currently detected.";
    }

    return "Traffic is currently flowing close to normal conditions.";
  }

  function getActions() {
    if (!traffic) {
      return [
        "Traffic recommendations are currently unavailable.",
      ];
    }

    const currentSpeed = Number(
      traffic.currentSpeed
    );

    const freeFlowSpeed = Number(
      traffic.freeFlowSpeed
    );

    if (traffic.roadClosure === true) {
      return [
        "Monitor the reported road closure.",
        "Check alternative routes for affected traffic.",
        "Continue monitoring the live traffic feed.",
      ];
    }

    if (
      !Number.isNaN(currentSpeed) &&
      !Number.isNaN(freeFlowSpeed) &&
      freeFlowSpeed > 0
    ) {
      const speedRatio =
        currentSpeed / freeFlowSpeed;

      if (speedRatio < 0.5) {
        return [
          "Monitor heavily congested traffic conditions.",
          "Consider alternative routes where available.",
          "Continue monitoring changes in traffic speed.",
        ];
      }

      if (speedRatio < 0.75) {
        return [
          "Continue monitoring traffic congestion.",
          "Monitor changes in traffic speed.",
        ];
      }
    }

    return [
      "Continue monitoring the live traffic feed.",
      "Monitor for sudden changes in traffic speed.",
    ];
  }

  function getConfidence() {
    if (
      !traffic ||
      traffic.confidence === undefined ||
      traffic.confidence === null
    ) {
      return null;
    }

    const value = Number(
      traffic.confidence
    );

    if (Number.isNaN(value)) {
      return null;
    }

    if (value <= 1) {
      return Math.round(value * 100);
    }

    return Math.round(value);
  }

  const confidence = getConfidence();

  return (
    <div className="ai-card">

      <div className="ai-header">
        <h2>AI Recommendation</h2>

        <span className="status">
          {loading ? "Loading" : "Live"}
        </span>
      </div>

      <div className="recommendation">

        <h3 className="tp">
          Traffic Prediction
        </h3>

        <p>
          {loading
            ? "Fetching live traffic conditions..."
            : getPrediction()}
        </p>

        {!loading &&
          traffic &&
          traffic.currentSpeed !== undefined &&
          traffic.freeFlowSpeed !== undefined && (
            <p>
              Current speed:{" "}
              <b>
                {traffic.currentSpeed} km/h
              </b>
              {" | "}
              Free-flow speed:{" "}
              <b>
                {traffic.freeFlowSpeed} km/h
              </b>
            </p>
          )}

      </div>

      <div className="recommendation">

        <h3>Suggested Actions</h3>

        <ul>
          {getActions().map(
            (action, index) => (
              <li key={index}>
                {action}
              </li>
            )
          )}
        </ul>

      </div>

      <div className="recommendation">

        <h3>Confidence</h3>

        <div className="confidence-bar">

          <div
            className="progress"
            style={{
              width:
                confidence !== null
                  ? `${Math.min(
                      Math.max(
                        confidence,
                        0
                      ),
                      100
                    )}%`
                  : "0%",
            }}
          ></div>

        </div>

        <p>
          {confidence !== null
            ? `${confidence}% Confidence`
            : "Confidence unavailable"}
        </p>

        <p>
          Traffic status:{" "}
          <b>
            {traffic?.severity ||
              "Unknown"}
          </b>
        </p>

      </div>

    </div>
  );
}

export default AIRecommendation;