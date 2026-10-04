import { useEffect, useState } from "react";

import { getAQIData } from "../Services/AQIservice";


function MostPollutedAreas() {

  const [areas, setAreas] = useState([]);


  const loadAreas = async () => {

    try {

      const data = await getAQIData();

      setAreas(data.areas || []);

    } catch (error) {

      console.error(
        "Failed to load polluted areas:",
        error
      );

    }

  };


  useEffect(() => {

    loadAreas();

    const interval = setInterval(
      loadAreas,
      60000
    );

    return () => clearInterval(interval);

  }, []);


  return (

    <div className="polluted-areas-card">

      <div className="pollution-card-header">

        <div>

          <h2>
            Most Polluted Areas
          </h2>

          <p>
            Areas ranked by current Air Quality Index
          </p>

        </div>

        <span className="areas-live">
          LIVE DATA
        </span>

      </div>


      <div className="polluted-areas-list">

        {areas.length === 0 ? (

          <p>
            Loading area data...
          </p>

        ) : (

          areas.map((area, index) => (

            <div
              className="polluted-area-row"
              key={area.name}
            >

              <div className="area-rank">
                {index + 1}
              </div>


              <div className="area-info">

                <h4>
                  {area.name}
                </h4>

                <span
                  className={`area-status ${area.level}`}
                >
                  {area.status}
                </span>

              </div>


              <div className="area-aqi">

                <strong>
                  {area.aqi}
                </strong>

                <span>
                  AQI
                </span>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );
}


export default MostPollutedAreas;