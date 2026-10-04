import TrafficHeader from "../components/TrafficHeader";
import TrafficStats from "../components/TrafficStats";
import "../styles/traffic.css";
import CongestionChart from "../components/CongestionChart";
import SignalStatus from "../components/SignalStatus";
import TrafficMap from "../components/TrafficMap";
import RoadClosures from "../components/RoadClosures";
import RouteRecommendation from "../components/RouteRecommendation";
import TrafficIncidents from "../components/TrafficIncidents";

function Traffic() {                                   
  return (
    <section id="traffic" className="traffic-page">

      <TrafficHeader />

      <TrafficStats />

      <TrafficMap />

      <div className="traffic-grid">

    <CongestionChart />

    <SignalStatus />

</div>
<div className="traffic-grid bottom-grid">
  <RoadClosures />
  <RouteRecommendation />
</div>
<TrafficIncidents />
    </section>
  );
}

export default Traffic;
