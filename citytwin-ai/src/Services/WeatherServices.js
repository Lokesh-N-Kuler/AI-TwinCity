const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getWeather() {
  const response = await fetch(
    `${API_URL}/api/weather/`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch weather data"
    );
  }

  return response.json();
}