import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { getCongestionByArea } from "../Services/trafficService";

function CongestionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCongestion = async () => {
    try {
      const result = await getCongestionByArea();

      console.log("REAL CONGESTION DATA:", result);

      setData(result);
    } catch (error) {
      console.error("Congestion Chart Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCongestion();

    // Refresh every 60 seconds
    const interval = setInterval(loadCongestion, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chart-card">

      <div className="chart-header">
        <div>
          <h2>Congestion by Area</h2>
          <p>Live traffic congestion levels</p>
        </div>

        <span className="live-label">
          LIVE
        </span>
      </div>

      {loading ? (
        <div className="chart-loading">
          Loading live traffic data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="area"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              label={{
                value: "Congestion %",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip
              formatter={(value) => [
                `${value}%`,
                "Congestion",
              ]}
            />

            <Bar
              dataKey="traffic"
              fill="#2563EB"
              radius={[5, 5, 0, 0]}
            />

          </BarChart>
        </ResponsiveContainer>
      )}

    </div>
  );
}

export default CongestionChart;