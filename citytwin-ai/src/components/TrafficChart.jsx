import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { getTrafficChart } from "../Services/trafficService";
import "../styles/chart.css";

function TrafficChart() {
  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    async function loadTraffic() {
      try {
        const data = await getTrafficChart();

        console.log("NEW TRAFFIC POINT:", data);

        setTrafficData((previousData) => {
          const updatedData = [...previousData, data];

          // Keep latest 10 readings
          return updatedData.slice(-10);
        });
      } catch (err) {
        console.error("Traffic Error:", err);
      }
    }

    // First reading
    loadTraffic();

    // New reading every 10 seconds
    const interval = setInterval(loadTraffic, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chart-card1">

      <h3>Live Traffic Flow</h3>

      <ResponsiveContainer width="100%" height={300}>

        <LineChart data={trafficData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="speed"
            stroke="#2563eb"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default TrafficChart;

