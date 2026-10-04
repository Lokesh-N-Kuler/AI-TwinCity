import { useEffect, useState } from "react";

import FloodHeader from "../components/FloodHeader";
import FloodStats from "../components/FloodStats";
import FloodMap from "../components/FloodMap";
import FloodChart from "../components/FloodChart";
import RiskAreas from "../components/RiskAreas";
import FloodPrediction from "../components/FloodPrediction";
import FloodAlerts from "../components/FloodAlerts";
import { getFloodData } from "../Services/FloodService";

import "../styles/flood.css";

function Flood() {
  const [showMap, setShowMap] = useState(false);
  const [floodData, setFloodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFloodData() {
      try {
        setLoading(true);

        const data = await getFloodData();

        setFloodData(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to load flood monitoring data.");
      } finally {
        setLoading(false);
      }
    }

    loadFloodData();
  }, []);

  if (loading) {
    return (
      <section id="flood" className="flood-page">
        <div className="flood-loading">
          Loading live flood monitoring data...
        </div>
      </section>
    );
  }

  if (error || !floodData) {
    return (
      <section id="flood" className="flood-page">
        <div className="flood-error">
          {error || "Flood data unavailable."}
        </div>
      </section>
    );
  }

  return (
    <section id="flood" className="flood-page">

      <FloodHeader
        updatedAt={floodData.updatedAt}
      />

      <FloodStats data={floodData} />

      <div className="flood-map-button-container">
        <button
          className="view-flood-map-btn"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap
            ? "Hide Flood Risk Map"
            : "View Flood Risk Map"}
        </button>
      </div>

      {showMap && (
        <FloodMap
          locations={floodData.map_locations || []}
        />
      )}

      <div className="flood-grid">

        <FloodChart
          data={floodData.chart_data || []}
          waterLevelSource={floodData.water_level_source}
        />

        <RiskAreas
          areas={floodData.risk_areas || []}
        />

        <FloodPrediction
          prediction={floodData.prediction}
        />

        <FloodAlerts
          alerts={floodData.alerts || []}
        />

      </div>

    </section>
  );
}

export default Flood;