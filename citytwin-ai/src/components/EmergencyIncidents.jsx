import { useEffect, useState } from "react";
import { getEmergencyData } from "../services/EmergencyService";

function EmergencyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIncidents() {
      try {
        const data = await getEmergencyData();
        setIncidents(data.incidents || []);
      } catch (error) {
        console.error("Emergency incidents error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadIncidents();
  }, []);

  return (
    <div className="incidents-card">

      <div className="emergency-card-header">
        <div>
          <h2>Active Incidents</h2>
          <p>
            Live emergency conditions across the city
          </p>
        </div>

        <span className="incident-live">
          LIVE
        </span>
      </div>

      <div className="incident-list">

        {loading && (
          <div className="incident-row">
            <div className="incident-info">
              <h4>Loading...</h4>
              <p>Fetching live emergency data</p>
            </div>
          </div>
        )}

        {!loading && incidents.length === 0 && (
          <div className="incident-row">

            <div className="incident-icon">
              ✓
            </div>

            <div className="incident-info">
              <div className="incident-title">
                <h4>No active incidents</h4>
              </div>

              <p>
                No high-severity traffic emergency
                condition is currently detected.
              </p>
            </div>

            <span className="incident-time">
              LIVE
            </span>

          </div>
        )}

        {incidents.map((incident) => (
          <div
            className="incident-row"
            key={incident.id}
          >

            <div className="incident-icon">
              🚨
            </div>

            <div className="incident-info">

              <div className="incident-title">

                <h4>
                  {incident.title}
                </h4>

                <span
                  className={`incident-level ${
                    incident.level?.toLowerCase() || "medium"
                  }`}
                >
                  {incident.level}
                </span>

              </div>

              <p>
                {incident.location}
              </p>

            </div>

            <span className="incident-time">
              LIVE
            </span>

          </div>
        ))}

      </div>

      <button className="view-incidents-btn">
        View All Incidents
      </button>

    </div>
  );
}

export default EmergencyIncidents;