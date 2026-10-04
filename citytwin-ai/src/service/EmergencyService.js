const API_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

let cachedData = null;
let lastFetchTime = 0;

const CACHE_DURATION = 60 * 1000;

export async function getEmergencyData() {
  const now = Date.now();

  if (
    cachedData &&
    now - lastFetchTime < CACHE_DURATION
  ) {
    return cachedData;
  }

  const response = await fetch(
    `${API_URL}/api/emergency/`
  );

  if (!response.ok) {
    throw new Error(
      `Emergency API failed with status ${response.status}`
    );
  }

  const data = await response.json();

  cachedData = data;
  lastFetchTime = now;

  return data;
}
