import { useEffect, useState } from "react";
import { getFloodData } from "../service/FloodService";

function RiskAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRiskAreas() {
      try {
        const data = await getFloodData();
        setAreas(data.risk_areas || []);
      } catch (error) {
        console.error("Risk areas error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRiskAreas();
  }, []);

  return (
    <div className="risk-areas-card">

      <div className="risk-header">
        <div>
          <h2>⚠ High-Risk Areas</h2>
          <p>Areas detected by the flood monitoring system</p>
        </div>
      </div>

      <div className="risk-list">

        {loading ? (
          <div className="flood-empty-state">
            Loading risk areas...
          </div>
        ) : areas.length === 0 ? (
          <div className="flood-empty-state">
            <strong>No active flood-risk areas detected.</strong>

            <p>
              The backend currently reports no affected or
              high-risk areas for this location.
            </p>
          </div>
        ) : (
          areas.map((area, index) => {
            const name =
              area.name ||
              area.area ||
              area.location ||
              "Unknown Area";

            const level =
              area.level ||
              area.risk_level ||
              area.riskLevel ||
              "Unknown";

            const water =
              area.water_level ??
              area.waterLevel ??
              "--";

            const status = level.toLowerCase().includes("high")
              ? "high"
              : level.toLowerCase().includes("medium")
              ? "medium"
              : "safe";

            return (
              <div className="risk-row" key={index}>

                <div className="risk-location">

                  <span className={`risk-dot ${status}`}></span>

                  <div>
                    <h4>{name}</h4>
                    <p>{level}</p>
                  </div>

                </div>

                <strong>
                  {typeof water === "number"
                    ? `${water} m`
                    : water}
                </strong>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}

export default RiskAreas;
