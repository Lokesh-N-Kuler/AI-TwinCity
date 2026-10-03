import { useEffect, useState } from "react";
import "../styles/recentAlerts.css";

function RecentAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchAlerts() {
    try {
      setError(false);

      const response = await fetch("http://127.0.0.1:8000/api/emergency/");

      if (!response.ok) {
        throw new Error("Failed to fetch emergency data");
      }

      const data = await response.json();

      const incidents = Array.isArray(data.incidents) ? data.incidents : [];

      const apiAlerts = Array.isArray(data.alerts) ? data.alerts : [];

      const combinedAlerts = [...incidents, ...apiAlerts];

      const formattedAlerts = combinedAlerts.map((alert, index) => {
        const isStatusAlert = alert.type === "success" && alert.message;

        const type = isStatusAlert
          ? "Traffic Status"
          : alert.type ||
            alert.incidentType ||
            alert.category ||
            alert.eventType ||
            "Incident";

        const location =
          alert.location ||
          alert.roadName ||
          alert.street ||
          alert.address ||
          data.location ||
          "Location unavailable";

        const severity =
          alert.severity ||
          alert.priority ||
          data.traffic?.severity ||
          "Unknown";

        const time =
          alert.time ||
          alert.timestamp ||
          alert.updatedAt ||
          alert.createdAt ||
          data.updatedAt ||
          null;

        return {
          id: alert.id || alert.incidentId || `alert-${index}`,

          type: formatType(type),

          location,

          severity: formatSeverity(severity),

          time: formatTime(time),

          message: alert.message || null,
        };
      });

      /*
       * If there are no actual incidents, show the
       * live traffic condition as a real status alert.
       */
      if (formattedAlerts.length === 0 && data.traffic) {
        formattedAlerts.push({
          id: "live-traffic-status",
          type: "Traffic Status",
          location: data.location || "Bengaluru",
          severity: data.traffic.severity || "Unknown",
          time: "LIVE",
          message: "Live traffic condition is currently being monitored.",
        });
      }

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error("Recent alerts error:", error);

      setAlerts([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function getSeverityFromType(type) {
    if (!type) {
      return null;
    }

    const value = String(type).toLowerCase();

    if (value === "success") {
      return "Low";
    }

    if (value === "warning") {
      return "Medium";
    }

    if (value === "danger" || value === "critical") {
      return "Critical";
    }

    return null;
  }

  function formatType(type) {
    return String(type)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatSeverity(severity) {
    const value = String(severity).toLowerCase();

    if (value.includes("critical")) {
      return "Critical";
    }

    if (value.includes("high")) {
      return "High";
    }

    if (value.includes("medium") || value.includes("moderate")) {
      return "Medium";
    }

    if (value.includes("low")) {
      return "Low";
    }

    if (value === "success") {
      return "Low";
    }

    return "Unknown";
  }

  function formatTime(value) {
    if (!value) {
      return "Time unavailable";
    }

    if (String(value).toUpperCase() === "LIVE") {
      return "LIVE";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const now = new Date();

    const difference = now.getTime() - date.getTime();

    const minutes = Math.floor(difference / (1000 * 60));

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} mins ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hrs ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} days ago`;
  }

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="alerts-card">
      <div className="alerts-header">
        <h2>🚨 Recent Alerts</h2>

        <span>{loading ? "Loading..." : `${alerts.length} Active`}</span>
      </div>

      {loading && (
        <div className="alert-item">
          <div className="alert-info">
            <h4>Loading live alerts...</h4>

            <p>Fetching current emergency data</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="alert-item">
          <div className="alert-info">
            <h4>Unable to load alerts</h4>

            <p>Emergency data is currently unavailable</p>
          </div>
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="alert-item">
          <div className="alert-info">
            <h4>No active alerts</h4>

            <p>No emergency alerts are currently reported.</p>
          </div>
        </div>
      )}

      {!loading &&
        !error &&
        alerts.map((alert) => (
          <div className="alert-item" key={alert.id}>
            <div className="alert-info">
              <h4>{alert.type}</h4>

              <p>{alert.location}</p>

              {alert.message && <small>{alert.message}</small>}
            </div>

            <div className="alert-right">
              <span className={`severity ${alert.severity.toLowerCase()}`}>
                {alert.severity}
              </span>

              <small>{alert.time}</small>
            </div>
          </div>
        ))}
    </div>
  );
}

export default RecentAlerts;
