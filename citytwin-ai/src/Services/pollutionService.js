const LATITUDE = 12.9716;
const LONGITUDE = 77.5946;

const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

// Get current Bengaluru air quality
export async function getCurrentAirQuality() {
  const url =
    `${BASE_URL}?latitude=${LATITUDE}` +
    `&longitude=${LONGITUDE}` +
    `&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone` +
    `&hourly=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone` +
    `&timezone=Asia%2FKolkata` +
    `&forecast_days=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Air Quality API failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.current) {
    throw new Error("No current air quality data received");
  }

  return {
    aqi: Math.round(data.current.us_aqi ?? 0),
    pm25: Number(data.current.pm2_5 ?? 0),
    pm10: Number(data.current.pm10 ?? 0),
    co: Number(data.current.carbon_monoxide ?? 0),
    no2: Number(data.current.nitrogen_dioxide ?? 0),
    so2: Number(data.current.sulphur_dioxide ?? 0),
    o3: Number(data.current.ozone ?? 0),
    updatedAt: data.current.time,
  };
}


// Get hourly AQI chart data
export async function getAQIChart() {
  const url =
    `${BASE_URL}?latitude=${LATITUDE}` +
    `&longitude=${LONGITUDE}` +
    `&hourly=us_aqi` +
    `&timezone=Asia%2FKolkata` +
    `&forecast_days=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`AQI chart API failed: ${response.status}`);
  }

  const data = await response.json();

  const times = data.hourly?.time || [];
  const aqiValues = data.hourly?.us_aqi || [];

  return times.map((time, index) => ({
    time: new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    aqi: Math.round(aqiValues[index] ?? 0),
  }));
}


// Get pollution levels for different Bengaluru areas
export async function getPollutionByArea() {
  const areas = [
    {
      area: "Central Bengaluru",
      latitude: 12.9716,
      longitude: 77.5946,
    },
    {
      area: "Indiranagar",
      latitude: 12.9784,
      longitude: 77.6408,
    },
    {
      area: "Whitefield",
      latitude: 12.9698,
      longitude: 77.7499,
    },
    {
      area: "Electronic City",
      latitude: 12.8452,
      longitude: 77.6602,
    },
    {
      area: "Yelahanka",
      latitude: 13.1007,
      longitude: 77.5963,
    },
  ];

  const results = await Promise.all(
    areas.map(async (area) => {
      const url =
        `${BASE_URL}?latitude=${area.latitude}` +
        `&longitude=${area.longitude}` +
        `&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Pollution API failed for ${area.area}: ${response.status}`
        );
      }

      const data = await response.json();
      const current = data.current || {};

      return {
        area: area.area,
        aqi: Math.round(current.us_aqi ?? 0),
        pm25: Number(current.pm2_5 ?? 0),
        pm10: Number(current.pm10 ?? 0),
        no2: Number(current.nitrogen_dioxide ?? 0),
        o3: Number(current.ozone ?? 0),
      };
    })
  );

  return results;
}


// AQI category
export function getAQIStatus(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}