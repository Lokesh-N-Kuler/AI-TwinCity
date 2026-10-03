import DashBoard from './pages/DashBoard.jsx'
import WeatherCard from "./components/WeatherCard.jsx";
import StatCard from './components/StatCard.jsx'
import CityMap from "./components/CityMap.jsx";
import TrafficChart from "./components/TrafficChart.jsx";
import AQIchart from "./components/AQIchart.jsx";
import AIRecommendation from "./components/AIRecommendation.jsx";
import "../src/App.css"
import RecentAlerts from "./components/RecentAlerts";
import Traffic from './pages/Traffic.jsx';
import Vnavbar from './pages/Vnavbar.jsx';
import Flood from "./pages/Flood.jsx";
import Pollution from "./pages/Pollution";
import Emergency from "./pages/Emergency";
import Analytics from "./pages/Analytics";
import AIAssistant from "./pages/AIAssistant";

function App() {

  return(
    <>
    
        <div className="mapnav" id="dashboard">
               <DashBoard/>

              <div className="map-card">
                  <h2>City Overview</h2>
                  <CityMap />
              </div>
              
        </div>
        <div className="graph">
        <div className="charts-row">
         <TrafficChart />
         <AQIchart/>
        </div>
        </div>
  
        <div className="Aicard">
        <AIRecommendation />
        </div>
        
        <div className="navstat">
        <WeatherCard/>
        <StatCard/>
        
        </div>
        
        <RecentAlerts />
        
        <div id="traffic">
          <Traffic />
          
        </div>
        
        <Flood />

        <Pollution />

        <Emergency />
        
        <Analytics />

        <AIAssistant />

        <div id="fixednav">
          <Vnavbar/>
        </div>
      
    </>
  ) ; 

}

export default App
