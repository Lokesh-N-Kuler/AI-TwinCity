import { useEffect, useState } from "react";

import { getAQIData } from "../Services/AQIservice";


function getPollutantStatus(name, value) {

  if (value === null || value === undefined) {
    return {
      status: "Unavailable",
      level: "moderate"
    };
  }


  const number = Number(value);


  if (name === "PM 2.5") {

    if (number <= 15) {
      return { status: "Good", level: "good" };
    }

    if (number <= 35) {
      return { status: "Moderate", level: "moderate" };
    }

    return { status: "High", level: "high" };
  }


  if (name === "PM 10") {

    if (number <= 45) {
      return { status: "Good", level: "good" };
    }

    if (number <= 100) {
      return { status: "Moderate", level: "moderate" };
    }

    return { status: "High", level: "high" };
  }


  if (name === "NO₂") {

    if (number <= 40) {
      return { status: "Good", level: "good" };
    }

    if (number <= 100) {
      return { status: "Moderate", level: "moderate" };
    }

    return { status: "High", level: "high" };
  }


  if (name === "SO₂") {

    if (number <= 40) {
      return { status: "Good", level: "good" };
    }

    if (number <= 100) {
      return { status: "Moderate", level: "moderate" };
    }

    return { status: "High", level: "high" };
  }


  if (name === "CO") {

    if (number <= 4000) {
      return { status: "Good", level: "good" };
    }

    if (number <= 10000) {
      return { status: "Moderate", level: "moderate" };
    }

    return { status: "High", level: "high" };
  }


  return {
    status: "Moderate",
    level: "moderate"
  };
}


function PollutantLevels() {

  const [data, setData] = useState(null);


  const loadData = async () => {

    try {

      const result = await getAQIData();

      setData(result);

    } catch (error) {

      console.error(
        "Failed to load pollutant data:",
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
      <div className="pollutant-card">

        <div className="pollution-card-header">

          <h2>
            Pollutant Levels
          </h2>

          <p>
            Loading live data...
          </p>

        </div>

      </div>
    );

  }


  const pollutants = [

    {
      name: "PM 2.5",
      value: data.pollutants.pm2_5,
      unit: "µg/m³"
    },

    {
      name: "PM 10",
      value: data.pollutants.pm10,
      unit: "µg/m³"
    },

    {
      name: "NO₂",
      value: data.pollutants.nitrogenDioxide,
      unit: "µg/m³"
    },

    {
      name: "SO₂",
      value: data.pollutants.sulphurDioxide,
      unit: "µg/m³"
    },

    {
      name: "CO",
      value: data.pollutants.carbonMonoxide,
      unit: "µg/m³"
    }

  ];


  return (

    <div className="pollutant-card">

      <div className="pollution-card-header">

        <h2>
          Pollutant Levels
        </h2>

        <p>
          Current air pollutant readings
        </p>

      </div>


      <div className="pollutant-list">

        {pollutants.map((item, index) => {

          const status =
            getPollutantStatus(
              item.name,
              item.value
            );


          return (

            <div
              className="pollutant-row"
              key={index}
            >

              <div className="pollutant-info">

                <h4>
                  {item.name}
                </h4>

                <span
                  className={`pollutant-status ${status.level}`}
                >
                  {status.status}
                </span>

              </div>


              <strong>

                {item.value !== null
                  ? Number(item.value).toFixed(1)
                  : "--"}

                <small>
                  {" "}
                  {item.unit}
                </small>

              </strong>

            </div>

          );

        })}

      </div>

    </div>

  );
}


export default PollutantLevels;