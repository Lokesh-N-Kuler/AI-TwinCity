export async function getAQIData() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/pollution/"
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