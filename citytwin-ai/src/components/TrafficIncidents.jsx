import { useEffect, useState } from "react";
import { getTrafficIncidents } from "../Services/trafficService";

function TrafficIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    try {
      const data = await getTrafficIncidents();

      console.log("REAL TRAFFIC INCIDENTS:", data);

      setIncidents(data);
    } catch (error) {
      console.error("Traffic Incidents Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();

    const interval = setInterval(loadIncidents, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="incidents-card">

      <div className="card-title">
        <div>
          <h2>Traffic Incidents</h2>
          <p>Live incidents in monitored area</p>
        </div>

        <span className="live-label">LIVE</span>
      </div>

      {loading ? (
        <div className="incident-loading">
          Loading traffic incidents...
        </div>
      ) : incidents.length === 0 ? (
        <div className="no-incidents">
          <h4>No active incidents</h4>
          <p>
            No traffic incidents detected at the moment.
          </p>
        </div>
      ) : (
        <div className="incident-list">

          {incidents.map((incident) => (
            <div
              className="incident-row"
              key={incident.id}
            >

              <div className="incident-info">

                <div
                  className={`incident-icon ${incident.severity.toLowerCase()}`}
                >
                  !
                </div>

                <div>
                  <h4>{incident.type}</h4>

                  <p>{incident.description}</p>
                </div>

              </div>

              <span
                className={`incident-severity ${incident.severity.toLowerCase()}`}
              >
                {incident.severity}
              </span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default TrafficIncidents;