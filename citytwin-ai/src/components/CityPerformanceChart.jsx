import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function CityPerformanceChart() {
  const [data, setData] = useState([]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/analytics/"
      );

      if (!response.ok) {
        throw new Error("Unable to fetch analytics data");
      }

      const result = await response.json();

      setData(result.performanceHistory || []);
    } catch (error) {
      console.error("Analytics chart error:", error);
    }
  };

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(() => {
      loadAnalytics();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-chart">
      {data.length === 0 ? (
        <div>
          <p>Collecting live performance data...</p>
          <p>
            Traffic and emergency history will appear here as CityTwin
            records real observations.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="traffic"
              name="Traffic"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="pollution"
              name="Pollution"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="emergency"
              name="Emergency"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default CityPerformanceChart;
