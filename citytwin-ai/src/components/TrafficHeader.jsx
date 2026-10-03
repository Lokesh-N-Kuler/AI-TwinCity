import { useEffect, useState } from "react";
import { getTraffic } from "../Services/trafficService";

function TrafficHeader() {
  const [traffic, setTraffic] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadTraffic = async () => {
    try {
      const data = await getTraffic();

      setTraffic(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Traffic Header Error:", error);
    }
  };

  useEffect(() => {
    loadTraffic();

    // Refresh every 30 seconds
    const interval = setInterval(loadTraffic, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatus = () => {
    if (!traffic) return "Loading...";

    if (traffic.congestionLevel === "High") {
      return "Heavy Traffic";
    }

    if (traffic.congestionLevel === "Moderate") {
      return "Moderate Traffic";
    }

    return "Low Traffic";
  };

  return (
    <div className="traffic-header">

      <div>
        <h1>Traffic Management</h1>

        <p>
          Real-time traffic monitoring and analysis
        </p>
      </div>

      <div className="traffic-header-status">

        <span className="status-dot"></span>

        <div>
          <strong>{getStatus()}</strong>

          <p>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Fetching live data..."}
          </p>
        </div>

      </div>

    </div>
  );
}

export default TrafficHeader;