import EmergencyHeader from "../components/EmergencyHeader";
import EmergencyStats from "../components/EmergencyStats";
import EmergencyIncidents from "../components/EmergencyIncidents";
import ResponseTeams from "../components/ResponseTeams";
import EmergencyMap from "../components/EmergencyMap";
import AIEmergencyAnalysis from "../components/AIEmergencyAnalysis";
import EmergencyAlerts from "../components/EmergencyAlerts";

import "../styles/emergency.css";

function Emergency() {
  return (
    <section id="emergency" className="emergency-page">
      <EmergencyHeader />

      <EmergencyStats />

      <div className="emergency-main-grid">
        <EmergencyIncidents />
        <ResponseTeams />
      </div>

      <EmergencyMap />

      <AIEmergencyAnalysis />

      <EmergencyAlerts />
    </section>
  );
}

export default Emergency;
