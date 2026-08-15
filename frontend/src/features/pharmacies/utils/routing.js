/**
 * Haversine straight-line distance in kilometers
 */
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatDuration(durationMinutes) {
  if (durationMinutes < 1) return "< 1 min";
  if (durationMinutes < 60) return `${Math.round(durationMinutes)} mins`;
  const hours = Math.floor(durationMinutes / 60);
  const mins = Math.round(durationMinutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Fetches turn-by-turn route geometry and stats from OSRM public routing API
 * with automatic fallback to geodetic straight-line estimations.
 */
export async function fetchRoute({ origin, destination, mode = "driving" }) {
  if (!origin || !destination) return null;

  // Map application transit mode to OSRM profile
  const osrmProfile = mode === "foot" ? "foot" : mode === "bike" ? "bike" : "driving";

  try {
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });

    if (response.ok) {
      const data = await response.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const primaryRoute = data.routes[0];
        const distanceKm = primaryRoute.distance / 1000;
        const durationMinutes = primaryRoute.duration / 60;

        // Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
        const coordinates = primaryRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        return {
          coordinates,
          distanceKm,
          distanceFormatted: formatDistance(distanceKm),
          durationMinutes,
          durationFormatted: formatDuration(durationMinutes),
          mode,
          isCalculated: true,
        };
      }
    }
  } catch (err) {
    // Graceful fallback below
  }

  // Fallback: Haversine straight line estimation
  const straightKm = calculateHaversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
  // Estimate road factor (1.3x straight line)
  const estimatedRoadKm = straightKm * 1.3;

  // Speeds in km/h: Driving: 32km/h, Walking: 4.5km/h, Transit: 22km/h, Bike: 14km/h
  const speed = mode === "foot" ? 4.5 : mode === "bike" ? 14 : mode === "transit" ? 22 : 32;
  const estimatedDurationMinutes = (estimatedRoadKm / speed) * 60;

  return {
    coordinates: [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ],
    distanceKm: estimatedRoadKm,
    distanceFormatted: formatDistance(estimatedRoadKm),
    durationMinutes: estimatedDurationMinutes,
    durationFormatted: formatDuration(estimatedDurationMinutes),
    mode,
    isCalculated: false,
  };
}
