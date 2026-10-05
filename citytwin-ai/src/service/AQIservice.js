const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getAQIData() {
  const response = await fetch(
    `${API_URL}/api/pollution/`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pollution data: ${response.status}`
    );
  }

  const data = await response.json();

  console.log("POLLUTION DATA:", data);

  return data;
}


export async function getAQI() {
  const data = await getAQIData();

  return Array.isArray(data.hourly)
    ? data.hourly
    : [];
}


export async function getCurrentAirQuality() {
  const data = await getAQIData();

  return {
    aqi: Number(data.aqi ?? 0),

    pm25: Number(
      data.pollutants?.pm2_5 ?? 0
    ),

    pm10: Number(
      data.pollutants?.pm10 ?? 0
    ),

    co: Number(
      data.pollutants?.carbonMonoxide ?? 0
    ),

    no2: Number(
      data.pollutants?.nitrogenDioxide ?? 0
    ),

    so2: Number(
      data.pollutants?.sulphurDioxide ?? 0
    ),

    o3: Number(
      data.pollutants?.ozone ?? 0
    ),

    updatedAt: data.updatedAt
  };
}


export async function getAQIChart() {
  const data = await getAQIData();

  if (!Array.isArray(data.hourly)) {
    return [];
  }

  return data.hourly.map((item) => ({
    time: new Date(
      item.time
    ).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    }),

    aqi: Number(item.aqi ?? 0)
  }));
}


export async function getPollutionByArea() {
  const data = await getAQIData();

  if (!Array.isArray(data.areas)) {
    return [];
  }

  return data.areas.map((area) => ({
    area: area.name,

    aqi:
      area.aqi === null
        ? null
        : Number(area.aqi),

    status: area.status,

    level: area.level,

    latitude: area.latitude,

    longitude: area.longitude
  }));
}


export function getAQIStatus(aqi) {

  if (aqi === null || aqi === undefined) {
    return "No Data";
  }

  if (aqi <= 50) {
    return "Good";
  }

  if (aqi <= 100) {
    return "Moderate";
  }

  if (aqi <= 150) {
    return "Unhealthy for Sensitive Groups";
  }

  if (aqi <= 200) {
    return "Unhealthy";
  }

  if (aqi <= 300) {
    return "Very Unhealthy";
  }

  return "Hazardous";
}