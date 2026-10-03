import { useEffect, useState } from "react";
import { getFloodData } from "../Services/FloodService";

function FloodStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadFloodData() {
      try {
        const result = await getFloodData();
        setData(result);
      } catch (error) {
        console.error("Flood stats error:", error);
        setError(true);
      }
    }

    loadFloodData();
  }, []);

  if (error) {
    return (
      <div className="flood-stats">
        <div className="flood-stat-card">
          <p className="flood-stat-title">Flood Data</p>
          <h2 className="flood-stat-value danger">Unavailable</h2>
          <p className="flood-stat-subtitle">
            Unable to fetch backend data
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flood-stats">
        {[1, 2, 3, 4].map((item) => (
          <div className="flood-stat-card" key={item}>
            <p className="flood-stat-title">Loading...</p>
            <h2 className="flood-stat-value">--</h2>
            <p className="flood-stat-subtitle">
              Fetching real-time data
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flood-stats">

      <div className="flood-stat-card">
        <p className="flood-stat-title">Flood Risk</p>

        <h2
          className={`flood-stat-value ${
            data.risk_score >= 70
              ? "danger"
              : data.risk_score >= 40
              ? "warning"
              : "blue"
          }`}
        >
          {data.riskLevel}
        </h2>

        <p className="flood-stat-subtitle">
          Risk score: {data.risk_score}/100
        </p>
      </div>

      <div className="flood-stat-card">
        <p className="flood-stat-title">Rainfall</p>

        <h2 className="flood-stat-value blue">
          {data.rainfall !== null && data.rainfall !== undefined
            ? `${data.rainfall} mm`
            : "N/A"}
        </h2>

        <p className="flood-stat-subtitle">
          Current rainfall
        </p>
      </div>

      <div className="flood-stat-card">
        <p className="flood-stat-title">Water Level</p>

        <h2 className="flood-stat-value warning">
          {data.water_level !== null &&
          data.water_level !== undefined
            ? `${data.water_level} m`
            : "N/A"}
        </h2>

        <p className="flood-stat-subtitle">
          Water-level sensor data unavailable
        </p>
      </div>

      <div className="flood-stat-card">
        <p className="flood-stat-title">Affected Areas</p>

        <h2 className="flood-stat-value danger">
          {data.affected_areas}
        </h2>

        <p className="flood-stat-subtitle">
          Currently affected
        </p>
      </div>

    </div>
  );
}

export default FloodStats;