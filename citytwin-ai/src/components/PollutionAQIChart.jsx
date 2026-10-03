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

import { getAQI } from "../Services/AQIservice";

import "../styles/pollution.css";


function PollutionAQIChart() {

  const [aqiData, setAqiData] = useState([]);

  const loadAQI = async () => {

    try {

      const data = await getAQI();

      const formattedData = data.map(item => ({

        time: new Date(item.time)
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }),

        aqi: item.aqi

      }));

      setAqiData(formattedData);

    } catch (error) {

      console.error(
        "Failed to load AQI data:",
        error
      );

    }

  };


  useEffect(() => {

    loadAQI();

    const interval = setInterval(
      loadAQI,
      60000
    );

    return () => clearInterval(interval);

  }, []);


  return (

    <div className="pollution-aqi-chart-card">

      <div className="pollution-card-header">

        <div>

          <h2>
            Live AQI Trend
          </h2>

          <p>
            Air Quality Index throughout the day
          </p>

        </div>

        <span className="aqi-live-badge">

          <span></span>

          LIVE

        </span>

      </div>


      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <LineChart data={aqiData}>

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="time"
          />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#2563eb"
            strokeWidth={3}
            name="AQI"
            dot={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );
}


export default PollutionAQIChart;