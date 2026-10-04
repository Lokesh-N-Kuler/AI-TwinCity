import { useEffect, useState } from "react";
import { getAQIData } from "../Services/AQIservice";

function PollutionStats() {

  const [data, setData] = useState(null);

  const loadData = async () => {

    try {

      const result = await getAQIData();

      setData(result);

    } catch (error) {

      console.error(
        "Failed to load pollution statistics:",
        error
      );

    }

  };


  useEffect(() => {

    loadData();

    const interval = setInterval(
      loadData,
      60000
    );

    return () => clearInterval(interval);

  }, []);


  if (!data) {

    return (
      <div className="pollution-stats">

        {[1, 2, 3, 4].map((item) => (

          <div
            className="pollution-stat-card"
            key={item}
          >
            <p className="pollution-stat-title">
              Loading...
            </p>

            <h2 className="pollution-stat-value">
              --
            </h2>

            <p className="pollution-stat-subtitle">
              Fetching live data
            </p>

          </div>

        ))}

      </div>
    );
  }


  const affectedAreas =
    data.areas?.filter(
      area => area.aqi > 100
    ).length || 0;


  const stats = [

    {
      title: "Current AQI",
      value: data.aqi,
      subtitle: data.status,
      type:
        data.aqi > 150
          ? "danger"
          : data.aqi > 100
            ? "warning"
            : "good"
    },

    {
      title: "PM 2.5",
      value:
        data.pollutants.pm2_5 !== null
          ? `${Number(data.pollutants.pm2_5).toFixed(1)} µg/m³`
          : "--",
      subtitle: "Fine particulate matter",
      type: "danger"
    },

    {
      title: "PM 10",
      value:
        data.pollutants.pm10 !== null
          ? `${Number(data.pollutants.pm10).toFixed(1)} µg/m³`
          : "--",
      subtitle: "Particulate pollution",
      type: "warning"
    },

    {
      title: "Affected Areas",
      value: affectedAreas,
      subtitle: "Areas with AQI above 100",
      type:
        affectedAreas > 2
          ? "danger"
          : "warning"
    }

  ];


  return (

    <div className="pollution-stats">

      {stats.map((item, index) => (

        <div
          className="pollution-stat-card"
          key={index}
        >

          <p className="pollution-stat-title">
            {item.title}
          </p>

          <h2
            className={`pollution-stat-value ${item.type}`}
          >
            {item.value}
          </h2>

          <p className="pollution-stat-subtitle">
            {item.subtitle}
          </p>

        </div>

      ))}

    </div>

  );
}

export default PollutionStats;