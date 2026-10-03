import "../styles/WeatherCard.css";
import { FaMapMarkerAlt, FaWind, FaTint } from "react-icons/fa";
import { WiDayCloudy } from "react-icons/wi";
import { useEffect, useState } from "react";
import { getWeather } from "../services/WeatherServices";

function WeatherCard() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        const data = await getWeather();

        console.log("Weather Data:", data);

        setWeather(data);
      } catch (error) {
        console.log("Weather Error:", error);
      }
    }

    loadWeather();
  }, []);

  return (
    <div className="weather-card">

      <div className="weather-header">
        <div className="location">
          <FaMapMarkerAlt className="icon location-icon" />

          <div>
            <h3>{weather?.location || "Bengaluru"}</h3>
            <p>Karnataka, India</p>
          </div>
        </div>
      </div>

      <div className="weather-main">
        <WiDayCloudy className="weather-icon" />

        <div>
          <h1>
            {weather?.temperature ?? "--"}°C
          </h1>

          <p>
            {weather ? "Current Weather" : "Loading..."}
          </p>
        </div>
      </div>

      <div className="weather-details">

        <div className="detail-box">
          <FaTint className="detail-icon" />

          <div>
            <span>
              Humidity - {weather?.humidity ?? "--"}%
            </span>
          </div>
        </div>

        <div className="detail-box">
          <FaWind className="detail-icon" />

          <div>
            <span>
              Wind - {weather?.windSpeed ?? "--"} Km/h
            </span>
          </div>
        </div>

      </div>

      <div className="updated">
        {weather?.updatedAt
          ? `Updated ${weather.updatedAt}`
          : "Updating..."}
      </div>

    </div>
  );
}

export default WeatherCard;

