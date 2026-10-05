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
import { getAnalyticsData } from "../service/analyticsService";

function CityPerformanceChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const result = await getAnalyticsData();

        setData(
          Array.isArray(result.performanceHistory)
            ? result.performanceHistory
            : []
        );
      } catch (error) {
        console.error("Analytics chart error:", error);
        setData([]);
      }
    };

    loadAnalytics();

    const interval = setInterval(loadAnalytics, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-chart">
      <div className="chart-header">
        <div>
          <h2>City Performance</h2>
          <p>Live traffic, pollution and emergency trends</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div>
          <p>Collecting live performance data...</p>
          <p>
            Traffic, pollution and emergency history will appear
            here as CityTwin records real observations.
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
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="pollution"
              name="Pollution"
              strokeWidth={2}
              dot={false}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="emergency"
              name="Emergency"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default CityPerformanceChart;