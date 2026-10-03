import { useEffect, useState } from "react";

import { getAQIData } from "../Services/AQIservice";


function AIPollutionAnalysis() {

  const [data, setData] = useState(null);


  const loadData = async () => {

    try {

      const result = await getAQIData();

      setData(result);

    } catch (error) {

      console.error(
        "Failed to load pollution analysis:",
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

      <div className="ai-pollution-card">

        <h2>
          AI Pollution Analysis
        </h2>

        <p>
          Loading current pollution analysis...
        </p>

      </div>

    );

  }


  const hourly = data.hourly || [];


  let prediction = "Air Quality Stable";

  let predictionText =
    "Current air-quality levels are relatively stable based on the available hourly data.";


  if (hourly.length >= 3) {

    const recent =
      hourly.slice(-3);

    const first =
      recent[0].aqi;

    const last =
      recent[recent.length - 1].aqi;

    if (last > first + 15) {

      prediction = "Air Quality May Worsen";

      predictionText =
        "The recent AQI trend is increasing. Continued monitoring is recommended.";

    } else if (last < first - 15) {

      prediction = "Air Quality Improving";

      predictionText =
        "The recent AQI trend is decreasing, indicating improving air-quality conditions.";

    }

  }


  const risk =
    data.aqi > 200
      ? "CRITICAL"
      : data.aqi > 150
        ? "HIGH"
        : data.aqi > 100
          ? "MODERATE"
          : "LOW";


  const recommendations = [];


  if (data.aqi > 100) {

    recommendations.push(
      "Monitor high-risk areas continuously."
    );

  }


  if (Number(data.pollutants.pm2_5) > 35) {

    recommendations.push(
      "Monitor elevated PM 2.5 concentrations."
    );

  }


  if (Number(data.pollutants.pm10) > 100) {

    recommendations.push(
      "Monitor particulate pollution near major roads."
    );

  }


  recommendations.push(
    "Use live traffic conditions to identify potential emission hotspots."
  );


  return (

    <div className="ai-pollution-card">

      <div className="ai-pollution-header">

        <div>

          <h2>
            AI Pollution Analysis
          </h2>

          <p>
            Analysis based on current air-quality data and AQI trends
          </p>

        </div>


        <span className="ai-analysis-badge">
          DATA ANALYSIS
        </span>

      </div>


      <div className="ai-pollution-content">


        <div className="pollution-prediction">

          <p className="analysis-label">
            CURRENT AIR QUALITY OUTLOOK
          </p>


          <h3>
            {prediction}
          </h3>


          <p className="analysis-text">
            {predictionText}
          </p>


          <div className="prediction-stats">


            <div className="prediction-stat">

              <span>
                Current AQI
              </span>

              <strong>
                {data.aqi}
              </strong>

            </div>


            <div className="prediction-stat">

              <span>
                Risk Level
              </span>

              <strong className="high-risk">
                {risk}
              </strong>

            </div>


            <div className="prediction-stat">

              <span>
                Location
              </span>

              <strong>
                Bengaluru
              </strong>

            </div>


          </div>

        </div>


        <div className="pollution-recommendations">

          <h3>
            Recommended Actions
          </h3>


          <ul>

            {recommendations.map(
              (recommendation, index) => (

                <li key={index}>
                  {recommendation}
                </li>

              )
            )}

          </ul>


          <button
            className="pollution-action-btn"
          >
            View Detailed Analysis
          </button>

        </div>


      </div>

    </div>

  );

}


export default AIPollutionAnalysis;