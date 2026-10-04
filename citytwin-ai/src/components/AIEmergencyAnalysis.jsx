import { useEffect, useState } from "react";
import { getEmergencyData } from "../service/EmergencyService";

function AIEmergencyAnalysis() {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const data = await getEmergencyData();
        setAnalysis(data.aiAnalysis || null);
      } catch (error) {
        console.error(
          "Emergency analysis error:",
          error
        );
      }
    }

    loadAnalysis();
  }, []);

  if (!analysis) {
    return (
      <div className="ai-emergency-card">
        Emergency analysis unavailable.
      </div>
    );
  }

  return (
    <div className="ai-emergency-card">

      <div className="ai-emergency-header">

        <div>
          <h2>AI Emergency Recommendation</h2>

          <p>
            Automated priority analysis from live traffic data
          </p>
        </div>

        <span className="ai-emergency-badge">
          AI ANALYSIS
        </span>

      </div>

      <div className="ai-emergency-content">

        <div className="emergency-priority">

          <p className="priority-label">
            HIGHEST PRIORITY INCIDENT
          </p>

          <h3>
            {analysis.incident}
          </h3>

          <p>
            {analysis.description}
          </p>

          <div className="priority-stats">

            <div>
              <span>Priority Score</span>

              <strong className="priority-red">
                {analysis.priorityScore}
              </strong>
            </div>

            <div>
              <span>People Affected</span>

              <strong>
                {analysis.peopleAffected}
              </strong>
            </div>

            <div>
              <span>Recommended Teams</span>

              <strong>
                {analysis.recommendedTeams}
              </strong>
            </div>

          </div>

        </div>

        <div className="ai-actions">

          <h3>
            Recommended Actions
          </h3>

          <ul>
            {analysis.actions?.map(
              (action, index) => (
                <li key={index}>
                  {action}
                </li>
              )
            )}
          </ul>

          <button>
            Generate Response Plan
          </button>

        </div>

      </div>

    </div>
  );
}

export default AIEmergencyAnalysis;
