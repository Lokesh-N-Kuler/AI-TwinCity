import "../styles/dashboard.css"
import "../styles/navbar.css"
import pfp from'../assets/profile.jpg'
import { useState } from "react";
function DashBoard()
{ 
    const [active, setActive] = useState("Dashboard");
    return(
        <>
        <div className="container">
        <div className="left">
            <nav>
            <h4 className="cp">CITY PILOT AI</h4>
            <h6 className="sc">Smart City Safe City</h6>
            
        </nav>
        <div className="center"><input placeholder="search anything"></input></div>
        </div>

        <div className="right">
        <img src={pfp} alt="profile" className="imgs"></img>
        <h6>Lokesh N K</h6>
        </div>
        </div><hr></hr>


        
       

        <div className="navgation">
    <nav className="sidebar">

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

export default DashBoard