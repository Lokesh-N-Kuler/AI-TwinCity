import { useEffect, useState } from "react";

function FloodAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [floodStatus, setFloodStatus] = useState("Unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchFloodData() {
    try {
      setError(false);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}"}/api/flood/`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch flood data");
      }

      const data = await response.json();

      const risk =
        data.riskLevel ||
        data.risk ||
        data.floodRisk ||
        data.status ||
        "Unknown";

      setFloodStatus(formatLevel(risk));

      const apiAlerts =
        Array.isArray(data.alerts)
          ? data.alerts
          : Array.isArray(data.incidents)
          ? data.incidents
          : Array.isArray(data.riskAreas)
          ? data.riskAreas
          : [];

      const formattedAlerts = apiAlerts.map(
        (alert, index) => {
          const area =
            alert.area ||
            alert.location ||
            alert.zone ||
            alert.name ||
            alert.region ||
            data.location ||
            "Monitored Area";

          const message =
            alert.message ||
            alert.description ||
            alert.warning ||
            alert.alert ||
            `Flood risk level: ${formatLevel(
              alert.level ||
                alert.riskLevel ||
                alert.risk ||
                risk
            )}.`;

          const level =
            alert.level ||
            alert.severity ||
            alert.riskLevel ||
            alert.risk ||
            risk;

          const time =
            alert.time ||
            alert.timestamp ||
            alert.updatedAt ||
            data.updatedAt ||
            null;

          return {
            id:
              alert.id ||
              alert.alertId ||
              `flood-${index}`,

            area,

            message,

            level: formatLevel(level),

            time: formatTime(time),
          };
        }
      );

      /*
       * If the API does not provide individual alert rows,
       * show the actual overall flood monitoring result.
       */
      if (
        formattedAlerts.length === 0 &&
        risk &&
        String(risk).toLowerCase() !== "unknown"
      ) {
        formattedAlerts.push({
          id: "flood-status",
          area:
            data.location ||
            "Flood Monitoring Area",

          message:
            data.message ||
            data.description ||
            `Current flood risk level is ${formatLevel(
              risk
            )}.`,

          level: formatLevel(risk),

          time: formatTime(
            data.updatedAt
          ),
        });
      }

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error(
        "Flood alerts error:",
        error
      );

      setAlerts([]);
      setFloodStatus("Unavailable");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFloodData();

    const interval = setInterval(
      fetchFloodData,
      60000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  function formatLevel(value) {
    if (!value) {
      return "Unknown";
    }

    const text = String(value)
      .toLowerCase()
      .replace(/_/g, " ");

    if (
      text.includes("critical") ||
      text.includes("severe") ||
      text.includes("very high")
    ) {
      return "Critical";
    }

    if (text.includes("high")) {
      return "High";
    }

    if (
      text.includes("medium") ||
      text.includes("moderate")
    ) {
      return "Medium";
    }

    if (
      text.includes("low") ||
      text.includes("safe") ||
      text.includes("normal")
    ) {
      return "Low";
    }

    return String(value);
  }

  function formatTime(value) {
    if (!value) {
      return "Time unavailable";
    }

    if (
      String(value).toUpperCase() === "LIVE"
    ) {
      return "LIVE";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    return `${days} days ago`;
  }

  return (
    <div className="flood-alerts-card">
      <div className="flood-alerts-header">
        <div>
          <h2>Flood Alerts & Emergency Status</h2>
          <p>
            Latest alerts from monitored areas
          </p>
        </div>

        <span className="alerts-live">
          <span className="alert-live-dot"></span>
          LIVE
        </span>
      </div>

      <div className="flood-alert-list">

        {loading && (
          <div className="flood-alert-row">
            <div className="alert-icon">
              ⚠
            </div>

            <div className="alert-info">
              <div className="alert-title-row">
                <h4>
                  Loading flood data...
                </h4>
              </div>

              <p>
                Fetching live flood monitoring results.
              </p>
            </div>

            <span className="alert-time">
              LIVE
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="flood-alert-row">
            <div className="alert-icon">
              ⚠
            </div>

            <div className="alert-info">
              <div className="alert-title-row">
                <h4>
                  Flood data unavailable
                </h4>
              </div>

              <p>
                Unable to retrieve the flood monitoring data.
              </p>
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          alerts.length === 0 && (
            <div className="flood-alert-row">
              <div className="alert-icon">
                ✓
              </div>

              <div className="alert-info">
                <div className="alert-title-row">
                  <h4>
                    No flood alerts
                  </h4>
                </div>

                <p>
                  No flood alerts are currently reported by the flood monitoring service.
                </p>
              </div>

              <span className="alert-time">
                LIVE
              </span>
            </div>
          )}

        {!loading &&
          !error &&
          alerts.map((alert) => (
            <div
              className="flood-alert-row"
              key={alert.id}
            >
              <div className="alert-icon">
                ⚠
              </div>

              <div className="alert-info">
                <div className="alert-title-row">
                  <h4>{alert.area}</h4>

                  <span
                    className={`alert-level ${alert.level.toLowerCase()}`}
                  >
                    {alert.level}
                  </span>
                </div>

                <p>{alert.message}</p>
              </div>

              <span className="alert-time">
                {alert.time}
              </span>
            </div>
          ))}
      </div>

      <div className="emergency-status">
        <div>
          <h3>Emergency Response Status</h3>

          <p>
            Current flood monitoring status:{" "}
            <strong>{floodStatus}</strong>
          </p>
        </div>

        <button className="emergency-btn">
          View Emergency Details
        </button>
      </div>
    </div>
  );
}

export default FloodAlerts;
