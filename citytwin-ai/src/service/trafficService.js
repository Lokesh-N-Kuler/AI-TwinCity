const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

const LATITUDE = 12.9716;
const LONGITUDE = 77.5946;

// Get real-time traffic flow
export async function getTraffic() {
  const url =
    `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json` +
    `?point=${LATITUDE},${LONGITUDE}` +
    `&unit=KMPH` +
    `&openLr=false` +
    `&key=${TOMTOM_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Traffic API failed: ${response.status}`);
  }

  const data = await response.json();

  const flow = data.flowSegmentData;

  if (!flow) {
    throw new Error("No traffic data received");
  }

  const currentSpeed = Math.round(flow.currentSpeed);
  const freeFlowSpeed = Math.round(flow.freeFlowSpeed);

  // Calculate congestion percentage
  let congestion = 0;

  if (freeFlowSpeed > 0) {
    congestion = Math.round(
      ((freeFlowSpeed - currentSpeed) / freeFlowSpeed) * 100
    );
  }

  congestion = Math.max(0, Math.min(100, congestion));

  let congestionLevel = "Low";

  if (congestion >= 60) {
    congestionLevel = "High";
  } else if (congestion >= 30) {
    congestionLevel = "Moderate";
  }

  return {
    currentSpeed,
    freeFlowSpeed,
    congestion,
    congestionLevel,
    confidence: flow.confidence,
    roadClosure: flow.roadClosure,
  };
}


// Data specifically for the live traffic chart
export async function getTrafficChart() {
  const data = await getTraffic();

  return {
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),

    speed: data.currentSpeed,
    freeFlowSpeed: data.freeFlowSpeed,
  };
}
export async function getCongestionByArea() {
  const areas = [
    {
      area: "MG Road",
      latitude: 12.9756,
      longitude: 77.6063,
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
      area: "Airport",
      latitude: 13.1986,
      longitude: 77.7066,
    },
    {
      area: "Electronic City",
      latitude: 12.8452,
      longitude: 77.6602,
    },
  ];

  const results = await Promise.all(
    areas.map(async (location) => {
      const url =
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json` +
        `?point=${location.latitude},${location.longitude}` +
        `&unit=KMPH` +
        `&openLr=false` +
        `&key=${TOMTOM_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Traffic API failed for ${location.area}: ${response.status}`
        );
      }

      const data = await response.json();
      const flow = data.flowSegmentData;

      if (!flow) {
        return {
          area: location.area,
          traffic: 0,
        };
      }

      const currentSpeed = Number(flow.currentSpeed);
      const freeFlowSpeed = Number(flow.freeFlowSpeed);

      let congestion = 0;

      if (freeFlowSpeed > 0) {
        congestion = Math.round(
          ((freeFlowSpeed - currentSpeed) / freeFlowSpeed) * 100
        );
      }

      congestion = Math.max(0, Math.min(100, congestion));

      return {
        area: location.area,
        traffic: congestion,
      };
    })
  );

  return results;
}
export async function getSignalStatus() {
  const intersections = [
    {
      name: "MG Road Junction",
      latitude: 12.9756,
      longitude: 77.6063,
    },
    {
      name: "Indiranagar Junction",
      latitude: 12.9784,
      longitude: 77.6408,
    },
    {
      name: "Whitefield Junction",
      latitude: 12.9698,
      longitude: 77.7499,
    },
  ];

  const results = await Promise.all(
    intersections.map(async (intersection) => {
      const url =
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json` +
        `?point=${intersection.latitude},${intersection.longitude}` +
        `&unit=KMPH` +
        `&openLr=false` +
        `&key=${TOMTOM_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Signal traffic API failed: ${response.status}`
        );
      }

      const data = await response.json();
      const flow = data.flowSegmentData;

      if (!flow) {
        return {
          name: intersection.name,
          status: "No Data",
          speed: null,
        };
      }

      const currentSpeed = Math.round(flow.currentSpeed);
      const freeFlowSpeed = Math.round(flow.freeFlowSpeed);

      const congestion =
        freeFlowSpeed > 0
          ? Math.round(
              ((freeFlowSpeed - currentSpeed) /
                freeFlowSpeed) *
                100
            )
          : 0;

      let status = "Normal";

      if (congestion >= 60) {
        status = "Heavy";
      } else if (congestion >= 30) {
        status = "Moderate";
      }

      return {
        name: intersection.name,
        status,
        speed: currentSpeed,
        congestion,
      };
    })
  );

  return results;
  
}
// Get real road closure / restriction incidents
// Get real road closure / restriction incidents
// Get real road closures and reverse-geocode their locations
export async function getRoadClosures() {
  const bbox = "77.50,12.85,77.80,13.15";

  const incidentUrl =
    `https://api.tomtom.com/traffic/services/5/incidentDetails` +
    `?bbox=${bbox}` +
    `&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description}}}}` +
    `&language=en-GB` +
    `&timeValidityFilter=present` +
    `&key=${TOMTOM_API_KEY}`;

  const response = await fetch(incidentUrl);

  if (!response.ok) {
    throw new Error(
      `Road closure API failed: ${response.status}`
    );
  }

  const data = await response.json();

  const incidents = data.incidents || [];

  // Only road closure incidents
  const closureIncidents = incidents.filter(
    (incident) =>
      incident.properties?.iconCategory === 8
  );

  // Reverse geocode one incident
  const reverseGeocode = async (
    latitude,
    longitude
  ) => {
    try {
      const url =
        `https://api.tomtom.com/search/2/reverseGeocode/` +
        `${latitude},${longitude}.json` +
        `?language=en-GB` +
        `&view=IN` +
        `&key=${TOMTOM_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error(
          "Reverse geocoding failed:",
          response.status
        );

        return null;
      }

      const data = await response.json();

      const result = data.addresses?.[0];

      if (!result) {
        return null;
      }

      const address = result.address || {};

      return {
        road:
          address.streetName ||
          address.street ||
          "Unknown Road",

        area:
          address.municipalitySubdivision ||
          address.municipality ||
          address.localName ||
          "Bengaluru",

        city:
          address.municipality ||
          "Bengaluru",

        district:
          address.countrySecondarySubdivision ||
          "",

        postalCode:
          address.postalCode ||
          "",
      };
    } catch (error) {
      console.error(
        "Reverse geocoding error:",
        error
      );

      return null;
    }
  };

  const closures = await Promise.all(
    closureIncidents
      .slice(0, 5)
      .map(async (incident, index) => {
        const coordinates =
          incident.geometry?.coordinates;

        let latitude = null;
        let longitude = null;

        // Point geometry
        if (
          Array.isArray(coordinates) &&
          coordinates.length >= 2 &&
          !Array.isArray(coordinates[0])
        ) {
          longitude = Number(coordinates[0]);
          latitude = Number(coordinates[1]);
        }

        // LineString geometry
        else if (
          Array.isArray(coordinates) &&
          Array.isArray(coordinates[0])
        ) {
          longitude = Number(
            coordinates[0][0]
          );

          latitude = Number(
            coordinates[0][1]
          );
        }

        let location = null;

        if (
          latitude !== null &&
          longitude !== null
        ) {
          location = await reverseGeocode(
            latitude,
            longitude
          );
        }

        const properties =
          incident.properties || {};

        const events =
          properties.events || [];

        const reason =
          events.length > 0 &&
          events[0].description
            ? events[0].description
            : "Road closure";

        return {
          id: index,

          road:
            location?.road ||
            "Road closure",

          area:
            location?.area ||
            "Bengaluru",

          city:
            location?.city ||
            "Bengaluru",

          postalCode:
            location?.postalCode ||
            "",

          reason,

          status: "Closed",

          latitude,
          longitude,
        };
      })
  );

  return closures;
}
// Generate route recommendation based on live traffic conditions
export async function getRouteRecommendation() {
  const routes = [
    {
      name: "MG Road",
      latitude: 12.9756,
      longitude: 77.6063,
    },
    {
      name: "Indiranagar",
      latitude: 12.9784,
      longitude: 77.6408,
    },
    {
      name: "Whitefield",
      latitude: 12.9698,
      longitude: 77.7499,
    },
    {
      name: "Electronic City",
      latitude: 12.8452,
      longitude: 77.6602,
    },
  ];

  const results = await Promise.all(
    routes.map(async (route) => {
      const url =
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json` +
        `?point=${route.latitude},${route.longitude}` +
        `&unit=KMPH` +
        `&openLr=false` +
        `&key=${TOMTOM_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Route traffic API failed: ${response.status}`
        );
      }

      const data = await response.json();
      const flow = data.flowSegmentData;

      if (!flow) {
        return {
          name: route.name,
          speed: null,
          congestion: 100,
        };
      }

      const currentSpeed = Math.round(flow.currentSpeed);
      const freeFlowSpeed = Math.round(flow.freeFlowSpeed);

      let congestion = 0;

      if (freeFlowSpeed > 0) {
        congestion = Math.round(
          ((freeFlowSpeed - currentSpeed) /
            freeFlowSpeed) *
            100
        );
      }

      congestion = Math.max(
        0,
        Math.min(100, congestion)
      );

      return {
        name: route.name,
        speed: currentSpeed,
        congestion,
      };
    })
  );

  // Sort from least congested to most congested
  results.sort((a, b) => a.congestion - b.congestion);

  return {
    recommended: results[0],
    alternatives: results.slice(1),
  };
}
// Get real-time traffic incidents
export async function getTrafficIncidents() {
  const bbox = "77.50,12.85,77.80,13.15";

  const url =
    `https://api.tomtom.com/traffic/services/5/incidentDetails` +
    `?bbox=${bbox}` +
    `&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description}}}}` +
    `&language=en-GB` +
    `&timeValidityFilter=present` +
    `&key=${TOMTOM_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Traffic incident API failed: ${response.status}`
    );
  }

  const data = await response.json();

  const incidents = data.incidents || [];

  return incidents.slice(0, 5).map((incident, index) => {
    const properties = incident.properties || {};
    const events = properties.events || [];

    let description = "Traffic incident";

    if (events.length > 0 && events[0].description) {
      description = events[0].description;
    }

    let type = "Incident";

    switch (properties.iconCategory) {
      case 1:
        type = "Accident";
        break;

      case 6:
        type = "Congestion";
        break;

      case 8:
        type = "Road Closure";
        break;

      case 9:
        type = "Road Works";
        break;

      default:
        type = "Traffic Incident";
    }

    let severity = "Low";

    if (properties.magnitudeOfDelay >= 4) {
      severity = "High";
    } else if (properties.magnitudeOfDelay >= 2) {
      severity = "Moderate";
    }

    return {
      id: index,
      type,
      description,
      severity,
    };
  });
}