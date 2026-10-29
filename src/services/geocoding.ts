import { GeoLocation } from '../types';

export const PILOT_LOCATIONS: GeoLocation[] = [
  {
    latitude: 13.23,
    longitude: 77.56,
    name: 'Bengaluru Rural (Doddaballapur)',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    country: 'India',
    isCurrentLocation: false,
    source: 'preset_pilot',
  },
  {
    latitude: 13.34,
    longitude: 77.10,
    name: 'Tumakuru Central (Sira-Gubbi Basin)',
    district: 'Tumakuru',
    state: 'Karnataka',
    country: 'India',
    isCurrentLocation: false,
    source: 'preset_pilot',
  },
  {
    latitude: 12.52,
    longitude: 76.90,
    name: 'Mandya (Cauvery Agricultural Basin)',
    district: 'Mandya',
    state: 'Karnataka',
    country: 'India',
    isCurrentLocation: false,
    source: 'preset_pilot',
  },
  {
    latitude: 15.46,
    longitude: 75.01,
    name: 'Dharwad (Malaprabha Agro-Zone)',
    district: 'Dharwad',
    state: 'Karnataka',
    country: 'India',
    isCurrentLocation: false,
    source: 'preset_pilot',
  },
  {
    latitude: 13.00,
    longitude: 76.10,
    name: 'Hassan (Hilly-Plateau Basin)',
    district: 'Hassan',
    state: 'Karnataka',
    country: 'India',
    isCurrentLocation: false,
    source: 'preset_pilot',
  },
];

/**
 * Requests browser geolocation permission and returns coordinates.
 */
export async function requestUserLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const placeInfo = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            name: placeInfo.name || `${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`,
            district: placeInfo.district,
            state: placeInfo.state,
            country: placeInfo.country || 'India',
            isCurrentLocation: true,
            accuracyMeters: Math.round(accuracy),
            source: 'browser_geolocation',
          });
        } catch {
          resolve({
            latitude,
            longitude,
            name: `Device Location (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`,
            country: 'India',
            isCurrentLocation: true,
            accuracyMeters: Math.round(accuracy),
            source: 'browser_geolocation',
          });
        }
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please select a location manually or pick a pilot district.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable on your device.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'The request to get user location timed out.';
        }
        reject(new Error(msg));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

/**
 * Reverse geocodes coordinates using Open-Meteo or BigDataCloud free endpoints
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ name: string; district?: string; state?: string; country?: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    const address = data.address || {};
    const localName =
      address.village ||
      address.town ||
      address.suburb ||
      address.city ||
      address.county ||
      address.state_district ||
      data.display_name?.split(',')[0];

    return {
      name: localName || `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
      district: address.county || address.state_district,
      state: address.state,
      country: address.country || 'India',
    };
  } catch {
    return {
      name: `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
      country: 'India',
    };
  }
}

/**
 * Searches for places across India using Open-Meteo Geocoding API
 */
export async function searchPlaces(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=6&language=en&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];

    return data.results.map((item: any) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      name: `${item.name}${item.admin2 ? `, ${item.admin2}` : ''}${item.admin1 ? `, ${item.admin1}` : ''}`,
      district: item.admin2,
      state: item.admin1,
      country: item.country || 'India',
      isCurrentLocation: false,
      source: 'search_geocoding',
    }));
  } catch {
    return [];
  }
}
