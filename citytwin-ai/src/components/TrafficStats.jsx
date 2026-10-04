import { useEffect, useState } from "react";
import { getTraffic } from "../Services/trafficService";

function TrafficStats() {
  const [traffic, setTraffic] = useState(null);

  const loadTraffic = async () => {
    try {
      const data = await getTraffic();

      console.log("TRAFFIC STATS DATA:", data);

      setTraffic(data);
    } catch (err) {
      console.error("Traffic Stats Error:", err);
    }
  };

  useEffect(() => {
    loadTraffic();

    const interval = setInterval(loadTraffic, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Current Speed",
      value: traffic
        ? `${traffic.currentSpeed} km/h`
        : "...",
      color: "#2563eb",
    },
    {
      title: "Free Flow Speed",
      value: traffic
        ? `${traffic.freeFlowSpeed} km/h`
        : "...",
      color: "#10b981",
    },
    {
      title: "Congestion",
      value: traffic
        ? `${traffic.congestion}%`
        : "...",
      color: "#f59e0b",
    },
    {
      title: "Traffic Level",
      value: traffic
        ? traffic.congestionLevel
        : "...",
      color: "#ef4444",
    },
  ];

  return (
    <div className="traffic-stats">
      {stats.map((item, index) => (
        <div className="traffic-card" key={index}>
          <h4>{item.title}</h4>

          <h2 style={{ color: item.color }}>
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
}

export default TrafficStats;