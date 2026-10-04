import { useEffect, useState } from "react";
import { getRoadClosures } from "../Services/trafficService";

function RoadClosures() {
  const [closures, setClosures] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClosures = async () => {
    try {
      const data = await getRoadClosures();

      console.log("REAL ROAD CLOSURES:", data);

      setClosures(data);
    } catch (error) {
      console.error("Road Closure Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClosures();

    const interval = setInterval(loadClosures, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="road-card">

      <div className="card-title">
        <div>
          <h2>Road Closures</h2>
          <p>Current road restrictions</p>
        </div>

        <span className="live-label">LIVE</span>
      </div>

      {loading ? (
        <div className="road-loading">
          Loading road conditions...
        </div>
      ) : closures.length === 0 ? (
        <div className="no-closures">
          <h4>No active road closures</h4>
          <p>
            No road closure incidents detected in the monitored area.
          </p>
        </div>
      ) : (
        <div className="closure-list">

          {closures.map((item) => (
            <div className="closure-row" key={item.id}>

             <div>
  <h4>{item.road}</h4>

  <p>{item.reason}</p>

  <small>
    Area: {item.area}
  </small>
</div>

              <span
                className={`road-status ${item.status.toLowerCase()}`}
              >
                {item.status}
              </span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default RoadClosures;