import { useEffect, useState } from "react";
import "../styles/emergency.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { getEmergencyData } from "../Services/EmergencyService";

function EmergencyMap() {
  const [showMap, setShowMap] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

  const trafficTileUrl =
    `https://api.tomtom.com/traffic/map/4/tile/flow/relative/` +
    `{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`;

  const toggleMap = async () => {
    const nextState = !showMap;

    setShowMap(nextState);

    if (nextState) {
      setLoading(true);

      try {
        const result = await getEmergencyData();
        setData(result);
      } catch (error) {
        console.log("Emergency map error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const traffic = data?.traffic;

  return (
    <div className="emergency-map-card">

      <div className="emergency-card-header">
        <div>
          <h2>Live Emergency Map</h2>
          <p>Real-time emergency and traffic monitoring</p>
        </div>

        <button
          className="view-emergency-map-btn"
          onClick={toggleMap}
        >
          {showMap ? "Hide Map" : "Show Map"}
        </button>
      </div>

      {showMap && (
        <div className="emergency-map">

          {loading ? (
            <div className="emergency-map-center">
              <h3>Loading Live Map</h3>
              <p>Fetching emergency monitoring data...</p>
            </div>
          ) : (
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
              {TOMTOM_API_KEY && (
                <TileLayer
                  url={trafficTileUrl}
                  opacity={0.8}
                />
              )}

              {/* Bengaluru Monitoring Point */}
              <Marker position={[12.9716, 77.5946]}>
                <Popup>
                  <strong>Bengaluru City Center</strong>
                  <br />
                  Traffic Speed:{" "}
                  {traffic?.currentSpeed !== null &&
                  traffic?.currentSpeed !== undefined
                    ? `${traffic.currentSpeed} km/h`
                    : "N/A"}
                  <br />
                  Free Flow Speed:{" "}
                  {traffic?.freeFlowSpeed !== null &&
                  traffic?.freeFlowSpeed !== undefined
                    ? `${traffic.freeFlowSpeed} km/h`
                    : "N/A"}
                  <br />
                  Severity: {traffic?.severity || "N/A"}
                  <br />
                  Road Closure:{" "}
                  {traffic?.roadClosure === true
                    ? "Detected"
                    : traffic?.roadClosure === false
                    ? "No"
                    : "N/A"}
                </Popup>
              </Marker>

              {/* Bellandur */}
              <Marker position={[12.9352, 77.6245]}>
                <Popup>
                  <strong>Bellandur</strong>
                  <br />
                  Bengaluru monitoring area
                </Popup>
              </Marker>

              {/* Silk Board */}
              <Marker position={[12.9177, 77.6237]}>
                <Popup>
                  <strong>Silk Board Junction</strong>
                  <br />
                  Bengaluru monitoring area
                </Popup>
              </Marker>

              {/* Whitefield */}
              <Marker position={[12.9698, 77.7499]}>
                <Popup>
                  <strong>Whitefield</strong>
                  <br />
                  Bengaluru monitoring area
                </Popup>
              </Marker>

              {/* Real Emergency Points */}
              {data?.mapPoints?.map((point, index) => {
                if (
                  point.latitude === undefined ||
                  point.longitude === undefined
                ) {
                  return null;
                }

                return (
                  <Marker
                    key={index}
                    position={[
                      point.latitude,
                      point.longitude,
                    ]}
                  >
                    <Popup>
                      <strong>
                        {point.label || "Emergency Incident"}
                      </strong>
                      <br />
                      Type: {point.type || "N/A"}
                      <br />
                      Severity: {point.severity || "N/A"}
                    </Popup>
                  </Marker>
                );
              })}

            </MapContainer>
          )}

        </div>
      )}

    </div>
  );
}

export default EmergencyMap;
