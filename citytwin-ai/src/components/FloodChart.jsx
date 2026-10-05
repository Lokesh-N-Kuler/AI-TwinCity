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

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}


function FloodChart({ data }) {

  const chartData = Array.isArray(data)
    ? data
    : [];

  const hasRainfall = chartData.some(
    (item) =>
      item.rainfall !== null &&
      item.rainfall !== undefined
  );

  const hasDischarge = chartData.some(
    (item) =>
      item.river_discharge !== null &&
      item.river_discharge !== undefined
  );


  return (
    <div className="flood-chart-card">

      <div className="chart-heading">

        <div>
          <h2>Rainfall & River Discharge</h2>

          <p>
            Environmental and river monitoring
          </p>
        </div>

        <span className="chart-source-status">
          {hasDischarge
            ? "Live environmental data"
            : "Rainfall data available"}
        </span>

      </div>


      {chartData.length === 0 ? (

        <div className="flood-chart-empty">
          No flood chart data available.
        </div>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <LineChart data={chartData}>

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
            />

            <YAxis />

            <Tooltip
              labelFormatter={formatTime}
            />

            <Legend />


            {hasRainfall && (
              <Line
                type="monotone"
                dataKey="rainfall"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                name="Rainfall (mm)"
              />
            )}


            {hasDischarge && (
              <Line
                type="monotone"
                dataKey="river_discharge"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
                name="River Discharge"
                connectNulls
              />
            )}

          </LineChart>

        </ResponsiveContainer>

      )}


      {!hasDischarge && chartData.length > 0 && (
        <p className="chart-note">
          River discharge data is currently unavailable.
          The rainfall series is shown using live weather data.
        </p>
      )}

    </div>
  );
}


export default FloodChart;