import "../styles/vnavbar.css"
import { useState } from "react";

function Vnavbar(){
    const [active, setActive] = useState("Dashboard");
    return(
        <>
            <div className="vnavgation">
    <nav className="vsidebar">

        <button
            className={active === "Dashboard" ? "active" : ""}
            onClick={() => {
            setActive("Dashboard");
            document.getElementById("dashboard").scrollIntoView({
            behavior: "smooth"
            });
            }}
            >
            Dashboard
        </button>

        <button
            className={active === "Traffic" ? "active" : ""}
            onClick={() => {
            setActive("Traffic");
            document.getElementById("traffic").scrollIntoView({
            behavior: "smooth"
            });
            }}
            >
            Traffic
        </button>


        <button
             className={active === "Flood" ? "active" : ""}
            onClick={() => {
            setActive("Flood");
            document.getElementById("flood").scrollIntoView({
            behavior: "smooth"
            });
            }}
            >
            Flood
        </button>

        <button
             className={active === "Pollution" ? "active" : ""}
            onClick={() => {
            setActive("Pollution");
            document.getElementById("pollution").scrollIntoView({
            behavior: "smooth"
            });
            }}
            >
            Pollution
        </button>

        <button
            className={active === "Emergency" ? "active" : ""}
            onClick={() => {
            setActive("Emergency");

            document.getElementById("emergency").scrollIntoView({
            behavior: "smooth",
            });
            }}
            >
            Emergency
        </button>

        <button
            className={active === "Analytics" ? "active" : ""}
            onClick={() => {
            setActive("Analytics");

            document.getElementById("analytics").scrollIntoView({
            behavior: "smooth",
            });
            }}
            >
            Analytics
        </button>


        <button
            className={active === "AI Assistant" ? "active" : ""}
            onClick={() => {
            setActive("AI Assistant");

            document
            .getElementById("ai-assistant")
            .scrollIntoView({
            behavior: "smooth",
            });
            }}
>
            AI Assistant
        </button>

        <button
            className={active === "Settings" ? "active" : ""}
            onClick={() => setActive("Settings")}
        >
            Settings
        </button>

    </nav>
</div>
        </>
    );
}
export default Vnavbar;