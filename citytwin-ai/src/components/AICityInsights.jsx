import { useEffect, useState } from "react";

function AICityInsights() {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/analytics/"
        );

        if (!response.ok) {
          throw new Error("Unable to fetch insights");
        }

        const result = await response.json();

        setInsights(result.insights || []);
      } catch (error) {
        console.error("Analytics insights error:", error);
      }
    };

    loadInsights();

    const interval = setInterval(loadInsights, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-city-card">
      <div className="ai-city-header">
        <div>
          <h2>City Performance Insights</h2>
          <p>Live analysis from connected city data sources</p>
        </div>

        <span className="ai-city-badge">
          LIVE
        </span>
      </div>

      <div className="insights-list">
        {insights.length === 0 ? (
          <div className="insight-item">
            <span className="insight-number">1</span>
            <p>Waiting for live analytics data...</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div
              className="insight-item"
              key={`${index}-${insight}`}
            >
              <span className="insight-number">
                {index + 1}
              </span>

              <p>{insight}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AICityInsights;