import { useEffect, useState } from "react";

import { getAQIData } from "../Services/AQIservice";


function PollutionHeader() {

  const [updatedAt, setUpdatedAt] = useState(null);


  const loadData = async () => {

    try {

      const data = await getAQIData();

      setUpdatedAt(data.updatedAt);

    } catch (error) {

      console.error(
        "Failed to load pollution update time:",
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


  return (

    <div className="pollution-header">

      <div>

        <h1>
          🌫 Pollution Monitoring
        </h1>

        <p>
          Monitor air quality and pollution levels across the city
        </p>

      </div>


      <div className="pollution-live-status">

        <span className="pollution-live-dot"></span>

        <span>
          Live Monitoring
        </span>

        {updatedAt && (

          <small>
            Updated{" "}
            {new Date(updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </small>

        )}

      </div>

    </div>

  );
}


export default PollutionHeader;