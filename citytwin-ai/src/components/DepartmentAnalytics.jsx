import { useEffect, useState } from "react";

function DepartmentAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}"}/api/analytics/`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch department analytics");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error("Department analytics error:", error);
      }
    };

    loadData();

    const interval = setInterval(loadData, 60000);

    return () => clearInterval(interval);
  }, []);

  const departments = data?.departments;

  const rows = [
    {
      name: "Traffic Management",
      score: departments?.traffic?.score,
      status: departments?.traffic?.status,
    },
    {
      name: "Air Quality",
      score: departments?.airQuality?.score,
      status: departments?.airQuality?.status,
    },
    {
      name: "Flood Monitoring",
      score: departments?.flood?.score,
      status: departments?.flood?.status,
    },
    {
      name: "Emergency Response",
      score: departments?.emergency?.score,
      status: departments?.emergency?.status,
    },
  ];

  return (
    <div className="department-analytics">
      {rows.map((department) => (
        <div
          className="department-row"
          key={department.name}
        >
          <div className="department-info">
            <h4>{department.name}</h4>

            <span className="department-status">
              {department.status || "Unavailable"}
            </span>
          </div>

          <div className="department-score">
            {department.score != null
              ? `${department.score}`
              : "N/A"}
          </div>

          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width:
                  department.score != null
                    ? `${Math.min(
                        100,
                        Math.max(0, department.score)
                      )}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default DepartmentAnalytics;
