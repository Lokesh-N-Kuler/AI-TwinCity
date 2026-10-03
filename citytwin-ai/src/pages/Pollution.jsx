import PollutionHeader from "../components/PollutionHeader";
import PollutionStats from "../components/PollutionStats";
import PollutionAQIChart from "../components/PollutionAQIChart";
import PollutantLevels from "../components/PollutantLevels";
import MostPollutedAreas from "../components/MostPollutedAreas";
import "../styles/pollution.css";
import AirQualityAlerts from "../components/AirQualityAlerts";
import AIPollutionAnalysis from "../components/AIPollutionAnalysis";
function Pollution() {
  return (
    <section id="pollution" className="pollution-page">
      <PollutionHeader />

      <PollutionStats />

      <div className="pollution-grid">
        <PollutionAQIChart />
        <PollutantLevels />
      </div>
      <MostPollutedAreas />
      <AIPollutionAnalysis />
      <AirQualityAlerts />
    </section>
  );
}

export default Pollution;