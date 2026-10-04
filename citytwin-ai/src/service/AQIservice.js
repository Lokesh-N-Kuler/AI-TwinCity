const API_URL =
  import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}";

export async function getAQIData() {
  const response = await fetch(
    `${API_URL}/api/pollution/`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pollution data");
  }

  const data = await response.json();

  console.log("POLLUTION DATA:", data);

  return data;
}

export async function getAQI() {
  const data = await getAQIData();

  return data.hourly || [];
}
