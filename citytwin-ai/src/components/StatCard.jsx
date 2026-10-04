import { useEffect, useState } from "react";
import "../styles/statcard.css";

import {
  FaCar,
  FaWater,
  FaSmog,
  FaExclamationTriangle,
} from "react-icons/fa";

function StatCard() {
  const [traffic, setTraffic] = useState(null);
  const [flood, setFlood] = useState(null);
  const [pollution, setPollution] = useState(null);
  const [alerts, setAlerts] = useState(null);

  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [
        emergencyResponse,
        floodResponse,
        pollutionResponse,
      ] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/emergency/`
        ),
        fetch(
          `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/flood/`
        ),
        fetch(
          "http://127.0.0.1:8000/api/pollution/"
        ),
      ]);

      if (!emergencyResponse.ok) {
        throw new Error(
          "Emergency API failed"
        );
      }

      if (!floodResponse.ok) {
        throw new Error(
          "Flood API failed"
        );
      }

      if (!pollutionResponse.ok) {
        throw new Error(
          "Pollution API failed"
        );
      }

      const emergencyData =
        await emergencyResponse.json();

      const floodData =
        await floodResponse.json();

      const pollutionData =
        await pollutionResponse.json();

      setTraffic(
        emergencyData.traffic || null
      );

      setFlood(floodData || null);

      setPollution(
        pollutionData || null
      );

      /*
       * Use the actual number of incidents
       * reported by the emergency API.
       */
      setAlerts(
        emergencyData.stats?.activeIncidents ?? 0
      );
    } catch (error) {
      console.error(
        "StatCard data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();

    const interval = setInterval(
      fetchData,
      60000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  function getTrafficValue() {
    if (!traffic) {
      return "N/A";
    }

    /*
     * The API provides speed, not vehicle count.
     * Do not display a fake vehicle number.
     */
    if (
      traffic.currentSpeed !== undefined &&
      traffic.freeFlowSpeed !== undefined
    ) {
      return `${traffic.currentSpeed} km/h`;
    }

    return "N/A";
  }

  function getTrafficDescription() {
    if (!traffic) {
      return "Unavailable";
    }

    if (traffic.severity) {
      return traffic.severity;
    }

    return "Live";
  }

  function getFloodRisk() {
    if (!flood) {
      return "N/A";
    }

    return (
      flood.riskLevel ||
      flood.risk ||
      flood.floodRisk ||
      flood.status ||
      "N/A"
    );
  }

  function getFloodPercentage() {
    if (!flood) {
      return "Unavailable";
    }

    const value =
      flood.riskPercentage ??
      flood.riskPercent ??
      flood.percentage ??
      flood.score;

    if (value === undefined || value === null) {
      return "Live risk data";
    }

    return `${value}%`;
  }

  function getAQI() {
    if (!pollution) {
      return "N/A";
    }

    const value =
      pollution.aqi ??
      pollution.AQI ??
      pollution.airQualityIndex;

    if (
      value === undefined ||
      value === null
    ) {
      return "N/A";
    }

    return value;
  }

  function getAQIDescription() {
    if (!pollution) {
      return "Unavailable";
    }

    return (
      pollution.category ||
      pollution.status ||
      pollution.level ||
      "Live"
    );
  }

  function getAlertDescription() {
    if (alerts === null) {
      return "Unavailable";
    }

    if (alerts === 0) {
      return "No active incidents";
    }

    return "Active incidents";
  }

  return (
    <div className="stats-container">

      <div className="stat-card1">
        <div className="icon traffic">
          <FaCar />
        </div>

        <div className="stat-content">
          <h4>Traffic</h4>

          <h2>
            {loading
              ? "..."
              : getTrafficValue()}
          </h2>

          <p>
            {loading
              ? "Loading"
              : getTrafficDescription()}
          </p>
        </div>
      </div>

      <div className="stat-card1">
        <div className="icon flood">
          <FaWater />
        </div>

        <div className="stat-content">
          <h4>Flood Risk</h4>

          <h2>
            {loading
              ? "..."
              : getFloodRisk()}
          </h2>

          <p>
            {loading
              ? "Loading"
              : getFloodPercentage()}
          </p>
        </div>
      </div>

      <div className="stat-card2">
        <div className="icon pollution">
          <FaSmog />
        </div>

        <div className="stat-content">
          <h4>AQI</h4>

          <h2>
            {loading
              ? "..."
              : getAQI()}
          </h2>

          <p>
            {loading
              ? "Loading"
              : getAQIDescription()}
          </p>
        </div>
      </div>

      <div className="stat-card2">
        <div className="icon alert">
          <FaExclamationTriangle />
        </div>

        <div className="stat-content">
          <h4>Alerts</h4>

          <h2>
            {loading
              ? "..."
              : alerts ?? "N/A"}
          </h2>

          <p>
            {loading
              ? "Loading"
              : getAlertDescription()}
          </p>
        </div>
      </div>

    </div>
  );
}

export default StatCard;