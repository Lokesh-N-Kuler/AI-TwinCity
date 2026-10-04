import { useEffect, useState } from "react";

function AnalyticsStats() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/analytics/`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch analytics");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error("Analytics stats error:", error);
      }
    };

    loadData();

    const interval = setInterval(loadData, 60000);

    return () => clearInterval(interval);
  }, []);

  const stats = data?.stats;

  return (
    <div className="analytics-stats">
      <div className="stat-card">
        <h3>Indian AQI</h3>
        <p>
          {stats?.indianAQI ?? "N/A"}
        </p>
        <span>
          {stats?.aqiCategory || "Unavailable"}
        </span>
      </div>

      <div className="stat-card">
        <h3>Traffic Efficiency</h3>
        <p>
          {stats?.trafficEfficiency != null
            ? `${stats.trafficEfficiency}%`
            : "N/A"}
        </p>
        <span>
          Real-time traffic flow
        </span>
      </div>

      <div className="stat-card">
        <h3>Dominant Pollutant</h3>
        <p>
          {stats?.dominantPollutant
            ? stats.dominantPollutant.toUpperCase()
            : "N/A"}
        </p>
        <span>
          CPCB AQI calculation
        </span>
      </div>

      <div className="stat-card">
        <h3>Emergency Incidents</h3>
        <p>
          {data?.emergency?.activeIncidents ?? "N/A"}
        </p>
        <span>
          Current active incidents
        </span>
      </div>
    </div>
  );
}

export default AnalyticsStats;
