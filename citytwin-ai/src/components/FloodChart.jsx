import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

function formatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function FloodChart({ data, waterLevelSource }) {
  return (
    <div className="flood-chart-card">

      <div className="chart-heading">

        <div>
          <h2>Rainfall & Water Level</h2>

          <p>
            Hourly environmental monitoring
          </p>
        </div>

        <span className="chart-source-status">
          {waterLevelSource
            ? "Live sensor data"
            : "Water-level sensor unavailable"}
        </span>

      </div>

      <ResponsiveContainer width="100%" height={300}>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
          />

          <YAxis />

          <Tooltip
            labelFormatter={formatTime}
          />

          <Legend />

          <Line
            type="monotone"
            dataKey="rainfall"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            name="Rainfall (mm)"
          />

          <Line
            type="monotone"
            dataKey="water_level"
            stroke="#ef4444"
            strokeWidth={3}
            dot={false}
            name="Water Level (m)"
            connectNulls={false}
          />

        </LineChart>

      </ResponsiveContainer>

      {!waterLevelSource && (
        <p className="chart-note">
          Water-level values are not fabricated. Connect an
          actual water-level/river sensor source to display
          this series.
        </p>
      )}

    </div>
  );
}

export default FloodChart;