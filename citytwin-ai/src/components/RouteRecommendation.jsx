import { useEffect, useState } from "react";
import { getRouteRecommendation } from "../Services/trafficService";

function RouteRecommendation() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRoutes = async () => {
    try {
      const data = await getRouteRecommendation();

      console.log("REAL ROUTE DATA:", data);

      setRouteData(data);
    } catch (error) {
      console.error("Route Recommendation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();

    const interval = setInterval(loadRoutes, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="route-card">

      <div className="card-title">
        <div>
          <h2>Route Recommendation</h2>
          <p>Based on live traffic conditions</p>
        </div>

        <span className="live-label">LIVE</span>
      </div>

      {loading ? (
        <div className="route-loading">
          Analyzing traffic routes...
        </div>
      ) : routeData ? (
        <>

          <div className="recommended-route">

            <div>
              <span className="route-label">
                RECOMMENDED
              </span>

              <h3>
                {routeData.recommended.name}
              </h3>

              <p>
                {routeData.recommended.speed !== null
                  ? `${routeData.recommended.speed} km/h`
                  : "No traffic data"}
              </p>
            </div>

            <div className="route-score">
              {routeData.recommended.congestion}%
              <span>congestion</span>
            </div>

          </div>

          <div className="route-alternatives">

            <h4>Alternative routes</h4>

            {routeData.alternatives
              .slice(0, 3)
              .map((route, index) => (

                <div
                  className="alternative-route"
                  key={index}
                >
                  <div>
                    <strong>{route.name}</strong>

                    <p>
                      {route.speed !== null
                        ? `${route.speed} km/h`
                        : "No data"}
                    </p>
                  </div>

                  <span>
                    {route.congestion}% congestion
                  </span>
                </div>

              ))}

          </div>

        </>
      ) : (
        <div className="route-loading">
          Unable to load route data.
        </div>
      )}

    </div>
  );
}

export default RouteRecommendation;