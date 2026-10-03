import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "../styles/flood.css";

function MapView() {
  const map = useMap();

  setTimeout(() => {
    map.invalidateSize();
  }, 100);

  return null;
}

function getRiskColor(risk) {
  if (risk === "High") {
    return "#dc2626";
  }

  if (risk === "Moderate") {
    return "#f59e0b";
  }

  if (risk === "Low") {
    return "#2563eb";
  }

  return "#16a34a";
}

function FloodMap({ locations }) {
  return (
    <div className="flood-map-card">

      <div className="flood-map-header">

        <div>
          <h2>Flood Risk Map</h2>
          <p>
            Geographic rainfall-based monitoring zones
          </p>
        </div>

        <div className="map-legend">

          <span>
            <i className="safe-dot"></i>
            Safe
          </span>

          <span>
            <i className="medium-dot"></i>
            Moderate
          </span>

          <span>
            <i className="high-dot"></i>
            High
          </span>

        </div>

      </div>

      <div className="flood-map geographic-map">

        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={11}
          scrollWheelZoom={true}
          className="leaflet-map"
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapView />

          {locations.map((location, index) => (

            <CircleMarker
              key={`${location.name}-${index}`}
              center={[
                location.latitude,
                location.longitude
              ]}
              radius={10}
              pathOptions={{
                color: getRiskColor(location.risk),
                fillColor: getRiskColor(location.risk),
                fillOpacity: 0.75
              }}
            >

              <Popup>

                <div className="flood-map-popup">

                  <h3>{location.name}</h3>

                  <p>
                    <strong>Risk:</strong>{" "}
                    {location.risk}
                  </p>

                  <p>
                    <strong>Rainfall:</strong>{" "}
                    {Number(location.rainfall).toFixed(1)} mm
                  </p>

                  <p>
                    <strong>Water Level:</strong>{" "}
                    {location.water_level == null
                      ? "N/A"
                      : `${location.water_level} m`}
                  </p>

                  <p className="popup-source">
                    Weather-derived monitoring
                  </p>

                </div>

              </Popup>

            </CircleMarker>

          ))}

        </MapContainer>

        {locations.length === 0 && (
          <div className="map-empty-message">
            <h3>No elevated-risk zones</h3>
            <p>
              Current monitoring data does not identify
              any elevated rainfall-risk locations.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

export default FloodMap;