import { useEffect, useState } from "react";
import { getEmergencyData } from "../service/EmergencyService";

function EmergencyAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await getEmergencyData();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error(
          "Emergency alerts error:",
          error
        );
      }
    }

    loadAlerts();
  }, []);

  return (
    <div className="emergency-alerts-card">

      <div className="emergency-card-header">

        <div>
          <h2>Emergency Activity</h2>

          <p>
            Latest updates from live monitoring
          </p>
        </div>

      </div>

      <div className="emergency-alert-list">

        {alerts.length === 0 && (
          <div className="emergency-alert-row">

            <span className="activity-dot success"></span>

            <p>
              No emergency activity is currently
              available from the connected source.
            </p>

            <span>
              LIVE
            </span>

          </div>
        )}

        {alerts.map((alert, index) => (
          <div
            className="emergency-alert-row"
            key={index}
          >

            <span
              className={`activity-dot ${
                alert.type || "warning"
              }`}
            ></span>

            <p>
              {alert.message}
            </p>

            <span>
              {alert.time || "LIVE"}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}

export default EmergencyAlerts;
