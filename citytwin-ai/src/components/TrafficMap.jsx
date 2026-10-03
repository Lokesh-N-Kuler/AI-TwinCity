import { useState } from "react";
import "../styles/traffic.css";

import {
MapContainer,
TileLayer,
Marker,
Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function TrafficMap() {
const [showMap, setShowMap] = useState(false);

const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

const trafficTileUrl =
`https://api.tomtom.com/traffic/map/4/tile/flow/relative/` +
`{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;

const toggleMap = () => {
setShowMap((previous) => !previous);
};

return ( <div className="traffic-map-card">


  <div className="map-header">
    <div>
      <h2>🗺 Live Traffic Map</h2>
      <p>Real-time city traffic monitoring</p>
    </div>

    <button
      className="refresh-btn"
      onClick={toggleMap}
    >
      {showMap ? "Hide Map" : "Show Map"}
    </button>
  </div>

  {showMap && (
    <div className="map-container">

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        style={{
          height: "100%",
          width: "100%",
        }}
      >

        {/* Base Map */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* TomTom Live Traffic Layer */}
        <TileLayer
          url={trafficTileUrl}
          opacity={0.8}
        />

        {/* Bengaluru */}
        <Marker position={[12.9716, 77.5946]}>
          <Popup>
            Bengaluru City Center
          </Popup>
        </Marker>

        {/* Bellandur */}
        <Marker position={[12.9352, 77.6245]}>
          <Popup>
            Bellandur
          </Popup>
        </Marker>

        {/* Silk Board */}
        <Marker position={[12.9177, 77.6237]}>
          <Popup>
            Silk Board Junction
          </Popup>
        </Marker>

        {/* Whitefield */}
        <Marker position={[12.9698, 77.7499]}>
          <Popup>
            Whitefield
          </Popup>
        </Marker>

      </MapContainer>

    </div>
  )}

</div>


);
}

export default TrafficMap;
