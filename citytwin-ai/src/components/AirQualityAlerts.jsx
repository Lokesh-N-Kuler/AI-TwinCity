import { useEffect, useState } from "react";

import { getAQIData } from "../Services/AQIservice";


function AirQualityAlerts() {

  const [alerts, setAlerts] = useState([]);


  const generateAlerts = (data) => {

    const generated = [];

    // Overall AQI
    if (data.aqi > 200) {

      generated.push({
        area: "Bengaluru",
        message:
          "Air quality is very unhealthy. Limit prolonged outdoor exposure.",
        level: "Critical"
      });

    } else if (data.aqi > 150) {

      generated.push({
        area: "Bengaluru",
        message:
          "AQI is unhealthy. Sensitive groups should reduce prolonged outdoor activities.",
        level: "High"
      });

    } else if (data.aqi > 100) {

      generated.push({
        area: "Bengaluru",
        message:
          "AQI is elevated. Sensitive groups should consider reducing prolonged outdoor activity.",
        level: "Moderate"
      });

    }


    // Area alerts
    data.areas?.forEach(area => {

      if (area.aqi > 200) {

        generated.push({
          area: area.name,
          message:
            `AQI has reached ${area.aqi}. Very unhealthy air quality detected.`,
          level: "Critical"
        });

      } else if (area.aqi > 150) {

        generated.push({
          area: area.name,
          message:
            `AQI is ${area.aqi}. Unhealthy air quality detected.`,
          level: "High"
        });

      }

    });


    return generated.slice(0, 5);
  };


  const loadAlerts = async () => {

    try {

      const data = await getAQIData();

      setAlerts(
        generateAlerts(data)
      );

    } catch (error) {

      console.error(
        "Failed to load air quality alerts:",
        error
      );

    }

  };


  useEffect(() => {

    loadAlerts();

    const interval = setInterval(
      loadAlerts,
      60000
    );

    return () => clearInterval(interval);

  }, []);


  return (

    <div className="air-alerts-card">

      <div className="air-alerts-header">

        <div>

          <h2>
            Air Quality Alerts
          </h2>

          <p>
            Latest pollution alerts across the city
          </p>

        </div>


        <span className="air-alert-live">

          <span className="air-live-dot"></span>

          LIVE

        </span>

      </div>


      <div className="air-alert-list">

        {alerts.length === 0 ? (

          <div className="air-alert-row">

            <div className="air-alert-info">

              <h4>
                No active pollution alerts
              </h4>

              <p>
                Current air-quality readings are below the configured alert thresholds.
              </p>

            </div>

          </div>

        ) : (

          alerts.map((alert, index) => (

            <div
              className="air-alert-row"
              key={index}
            >

              <div className="air-alert-icon">
                ⚠
              </div>


              <div className="air-alert-info">

                <div className="air-alert-title">

                  <h4>
                    {alert.area}
                  </h4>

                  <span
                    className={`air-alert-level ${alert.level.toLowerCase()}`}
                  >
                    {alert.level}
                  </span>

                </div>


                <p>
                  {alert.message}
                </p>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );
}


export default AirQualityAlerts;