export interface Coordinates {
  lat: number;
  lng: number;
}

const GOOGLE_MAPS_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

/**
 * Geocode a human-readable address into latitude/longitude coordinates
 * using the Google Maps Geocoding API.
 *
 * This requires the GOOGLE_MAPS_API_KEY environment variable to be set.
 */
export async function geocodeAddress(address: string): Promise<Coordinates> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }

  const fetchFn: any = (global as any).fetch;

  if (!fetchFn) {
    throw new Error(
      'Global fetch is not available. Please run on Node 18+ or add a fetch polyfill.'
    );
  }

  const url = `${GOOGLE_MAPS_GEOCODE_URL}?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const response = await fetchFn(url);

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data || data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error(`Geocoding failed with status: ${data?.status || 'UNKNOWN'}`);
  }

  const location = data.results[0].geometry.location;

  return {
    lat: location.lat,
    lng: location.lng,
  };
}

/**
 * Compute the great-circle distance between two coordinates using
 * the Haversine formula.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

