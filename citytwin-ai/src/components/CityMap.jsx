import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "../styles/CityMap.css"
function CityMap() {
    return (
        <div className="MapContainer">
        <MapContainer 
            center={[12.9716, 77.5946]}
            zoom={12}
            style={{
                height: "400px",
                width: "100%",
                borderRadius: "12px"
            }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[12.9716, 77.5946]}>
                <Popup>
                    Bengaluru
                </Popup>
            </Marker>

        </MapContainer>
        </div>
    );
}

export default CityMap;