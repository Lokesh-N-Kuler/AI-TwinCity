import { useEffect, useState } from "react";
import { getEmergencyData } from "../Services/EmergencyService";

function EmergencyStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadEmergencyData() {
      try {
        const result = await getEmergencyData();
        setData(result);
      } catch (error) {
        console.error("Emergency stats error:", error);
        setError(true);
      }
    }

    loadEmergencyData();
  }, []);

  if (error) {
    return (
      <div className="emergency-stats">
        <div className="emergency-stat-card">
          <p>Emergency Data</p>
          <h2 className="red">Unavailable</h2>
          <span>Unable to fetch live data</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="emergency-stats">
        {[1, 2, 3, 4].map((item) => (
          <div className="emergency-stat-card" key={item}>
            <p>Loading...</p>
            <h2>--</h2>
            <span>Fetching real-time data</span>
          </div>
        ))}
      </div>
    );
  }

  const traffic = data.traffic || {};

  const severityClass =
    traffic.severity === "Critical"
      ? "red"
      : traffic.severity === "High"
      ? "orange"
      : traffic.severity === "Medium"
      ? "orange"
      : "green";

  return (
    <div className="emergency-stats">

      <div className="emergency-stat-card">
        <p>Active Incidents</p>

        <h2 className="red">
          {data.stats?.activeIncidents ?? 0}
        </h2>

        <span>
          Current live conditions
        </span>
      </div>

      <div className="emergency-stat-card">
        <p>Critical Alerts</p>

        <h2 className="orange">
          {data.stats?.criticalAlerts ?? 0}
        </h2>

        <span>
          Immediate attention required
        </span>
      </div>

      <div className="emergency-stat-card">
        <p>Current Speed</p>

        <h2 className="blue">
          {traffic.currentSpeed ?? "N/A"} km/h
        </h2>

        <span>
          Free flow: {traffic.freeFlowSpeed ?? "N/A"} km/h
        </span>
      </div>

      <div className="emergency-stat-card">
        <p>Traffic Severity</p>

        <h2 className={severityClass}>
          {traffic.severity ?? "Unknown"}
        </h2>

        <span>
          Road closure:{" "}
          {traffic.roadClosure ? "Yes" : "No"}
        </span>
      </div>

    </div>
  );
}

export default EmergencyStats;