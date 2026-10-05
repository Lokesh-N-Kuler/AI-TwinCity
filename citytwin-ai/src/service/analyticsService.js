const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getAnalyticsData() {
  const response = await fetch(
    `${API_URL}/api/analytics/`
  );

  if (!response.ok) {
    throw new Error(
      `Analytics API failed with status ${response.status}`
    );
  }

  const data = await response.json();

  console.log("ANALYTICS DATA:", data);

  return data;
}