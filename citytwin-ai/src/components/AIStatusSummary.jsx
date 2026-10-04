import { useEffect, useState } from "react";

function AIStatusSummary() {
  const [status, setStatus] = useState([
    {
      title: "Traffic",
      value: "Loading...",
      description: "Fetching live traffic data",
      type: "blue",
    },
    {
      title: "Flood Risk",
      value: "Loading...",
      description: "Fetching live flood data",
      type: "green",
    },
    {
      title: "Air Quality",
      value: "Loading...",
      description: "Fetching live air quality data",
      type: "orange",
    },
    {
      title: "Emergency",
      value: "Loading...",
      description: "Fetching live emergency data",
      type: "red",
    },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}"}/api/ai/status`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch AI status");
        }

        const data = await response.json();

        if (cancelled) return;

        setStatus([
          {
            title: "Traffic",
            value: data.traffic?.value ?? "N/A",
            description:
              data.traffic?.description ?? "Live traffic data unavailable",
            type: "blue",
          },
          {
            title: "Flood Risk",
            value: data.flood?.value ?? "N/A",
            description:
              data.flood?.description ?? "Live flood data unavailable",
            type: "green",
          },
          {
            title: "Air Quality",
            value: data.airQuality?.value ?? "N/A",
            description:
              data.airQuality?.description ??
              "Live air quality data unavailable",
            type: "orange",
          },
          {
            title: "Emergency",
            value: data.emergency?.value ?? "N/A",
            description:
              data.emergency?.description ??
              "Live emergency data unavailable",
            type: "red",
          },
        ]);
      } catch (error) {
        if (cancelled) return;

        setStatus([
          {
            title: "Traffic",
            value: "N/A",
            description: "Unable to fetch live traffic data",
            type: "blue",
          },
          {
            title: "Flood Risk",
            value: "N/A",
            description: "Unable to fetch live flood data",
            type: "green",
          },
          {
            title: "Air Quality",
            value: "N/A",
            description: "Unable to fetch live air quality data",
            type: "orange",
          },
          {
            title: "Emergency",
            value: "N/A",
            description: "Unable to fetch live emergency data",
            type: "red",
          },
        ]);
      }
    }

    fetchStatus();

    const interval = setInterval(fetchStatus, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="ai-status-summary">

      {status.map((item, index) => (
        <div className="ai-status-card" key={index}>

          <p>{item.title}</p>

          <h3 className={item.type}>
            {item.value}
          </h3>

          <span>{item.description}</span>

        </div>
      ))}

    </div>
  );
}

export default AIStatusSummary;
