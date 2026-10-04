const API_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getFloodData() {
  const response = await fetch(
    `${API_URL}/api/flood/`
  );

  if (!response.ok) {
    throw new Error(
      `Flood API failed with status ${response.status}`
    );
  }

  return await response.json();
}
