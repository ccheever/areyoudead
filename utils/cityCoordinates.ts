// City coordinates for nearest-city wallpaper selection
// Coordinates are approximate city centers

export interface CityData {
  name: string;
  lat: number;
  lng: number;
  imageKey: string;
}

export const CITY_COORDINATES: CityData[] = [
  // US Cities
  { name: "Albuquerque", lat: 35.0844, lng: -106.6504, imageKey: "albuquerque_new_mexico" },
  { name: "Anchorage", lat: 61.2181, lng: -149.9003, imageKey: "anchorage_alaska" },
  { name: "Atlanta", lat: 33.749, lng: -84.388, imageKey: "atlanta_georgia" },
  { name: "Baltimore", lat: 39.2904, lng: -76.6122, imageKey: "baltimore_maryland" },
  { name: "Billings", lat: 45.7833, lng: -108.5007, imageKey: "billings_montana" },
  { name: "Birmingham", lat: 33.5207, lng: -86.8025, imageKey: "birmingham_alabama" },
  { name: "Boise", lat: 43.615, lng: -116.2023, imageKey: "boise_idaho" },
  { name: "Boston", lat: 42.3601, lng: -71.0589, imageKey: "boston_massachusetts" },
  { name: "Bridgeport", lat: 41.1865, lng: -73.1952, imageKey: "bridgeport_connecticut" },
  { name: "Burlington", lat: 44.4759, lng: -73.2121, imageKey: "burlington_vermont" },
  { name: "Charleston SC", lat: 32.7765, lng: -79.9311, imageKey: "charleston_south_carolina" },
  { name: "Charleston WV", lat: 38.3498, lng: -81.6326, imageKey: "charleston_west_virginia" },
  { name: "Charlotte", lat: 35.2271, lng: -80.8431, imageKey: "charlotte_north_carolina" },
  { name: "Cheyenne", lat: 41.14, lng: -104.8202, imageKey: "cheyenne_wyoming" },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, imageKey: "chicago_illinois" },
  { name: "Columbus", lat: 39.9612, lng: -82.9988, imageKey: "columbus_ohio" },
  { name: "Denver", lat: 39.7392, lng: -104.9903, imageKey: "denver_colorado" },
  { name: "Des Moines", lat: 41.5868, lng: -93.625, imageKey: "des_moines_iowa" },
  { name: "Detroit", lat: 42.3314, lng: -83.0458, imageKey: "detroit_michigan" },
  { name: "Fargo", lat: 46.8772, lng: -96.7898, imageKey: "fargo_north_dakota" },
  { name: "Honolulu", lat: 21.3069, lng: -157.8583, imageKey: "honolulu_hawaii" },
  { name: "Houston", lat: 29.7604, lng: -95.3698, imageKey: "houston_texas" },
  { name: "Indianapolis", lat: 39.7684, lng: -86.1581, imageKey: "indianapolis_indiana" },
  { name: "Jackson", lat: 32.2988, lng: -90.1848, imageKey: "jackson_mississippi" },
  { name: "Jacksonville", lat: 30.3322, lng: -81.6557, imageKey: "jacksonville_florida" },
  { name: "Kansas City", lat: 39.0997, lng: -94.5786, imageKey: "kansas_city_missouri" },
  { name: "Las Vegas", lat: 36.1699, lng: -115.1398, imageKey: "las_vegas_nevada" },
  { name: "Little Rock", lat: 34.7465, lng: -92.2896, imageKey: "little_rock_arkansas" },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, imageKey: "los_angeles_california" },
  { name: "Louisville", lat: 38.2527, lng: -85.7585, imageKey: "louisville_kentucky" },
  { name: "Manchester", lat: 42.9956, lng: -71.4548, imageKey: "manchester_new_hampshire" },
  { name: "Milwaukee", lat: 43.0389, lng: -87.9065, imageKey: "milwaukee_wisconsin" },
  { name: "Minneapolis", lat: 44.9778, lng: -93.265, imageKey: "minneapolis_minnesota" },
  { name: "Nashville", lat: 36.1627, lng: -86.7816, imageKey: "nashville_tennessee" },
  { name: "New Orleans", lat: 29.9511, lng: -90.0715, imageKey: "new_orleans_louisiana" },
  { name: "New York City", lat: 40.7128, lng: -74.006, imageKey: "new_york_city" },
  { name: "Newark", lat: 40.7357, lng: -74.1724, imageKey: "newark_new_jersey" },
  { name: "Oklahoma City", lat: 35.4676, lng: -97.5164, imageKey: "oklahoma_city_oklahoma" },
  { name: "Omaha", lat: 41.2565, lng: -95.9345, imageKey: "omaha_nebraska" },
  { name: "Palo Alto", lat: 37.4419, lng: -122.143, imageKey: "palo_alto_california" },
  { name: "Philadelphia", lat: 39.9526, lng: -75.1652, imageKey: "philadelphia_pennsylvania" },
  { name: "Phoenix", lat: 33.4484, lng: -112.074, imageKey: "phoenix_arizona" },
  { name: "Portland ME", lat: 43.6591, lng: -70.2568, imageKey: "portland_maine" },
  { name: "Portland OR", lat: 45.5152, lng: -122.6784, imageKey: "portland_oregon" },
  { name: "Providence", lat: 41.824, lng: -71.4128, imageKey: "providence_rhode_island" },
  { name: "Salt Lake City", lat: 40.7608, lng: -111.891, imageKey: "salt_lake_city_utah" },
  { name: "Seattle", lat: 47.6062, lng: -122.3321, imageKey: "seattle_washington" },
  { name: "Sioux Falls", lat: 43.5446, lng: -96.7311, imageKey: "sioux_falls_south_dakota" },
  { name: "Virginia Beach", lat: 36.8529, lng: -75.978, imageKey: "virginia_beach_virginia" },
  { name: "Wichita", lat: 37.6872, lng: -97.3301, imageKey: "wichita_kansas" },
  { name: "Wilmington", lat: 39.7391, lng: -75.5398, imageKey: "wilmington_delaware" },

  // International Cities
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041, imageKey: "amsterdam_netherlands" },
  { name: "Delhi", lat: 28.6139, lng: 77.209, imageKey: "delhi_india" },
  { name: "Florianopolis", lat: -27.5954, lng: -48.548, imageKey: "florianopolis_brazil" },
  { name: "Frankfurt", lat: 50.1109, lng: 8.6821, imageKey: "frankfurt_germany" },
  { name: "Krakow", lat: 50.0647, lng: 19.945, imageKey: "krakow_poland" },
  { name: "London", lat: 51.5074, lng: -0.1278, imageKey: "london_uk" },
  { name: "Oslo", lat: 59.9139, lng: 10.7522, imageKey: "oslo_norway" },
  { name: "Prague", lat: 50.0755, lng: 14.4378, imageKey: "prague_czech_republic" },
  { name: "Taipei", lat: 25.033, lng: 121.5654, imageKey: "taipei_taiwan" },
  { name: "Vancouver", lat: 49.2827, lng: -123.1207, imageKey: "vancouver_canada" },
];

// Image requires map - React Native needs static requires
export const CITY_IMAGES: Record<string, any> = {
  albuquerque_new_mexico: require("../assets/city_wallpapers/albuquerque_new_mexico.png"),
  amsterdam_netherlands: require("../assets/city_wallpapers/amsterdam_netherlands.png"),
  anchorage_alaska: require("../assets/city_wallpapers/anchorage_alaska.png"),
  atlanta_georgia: require("../assets/city_wallpapers/atlanta_georgia.png"),
  baltimore_maryland: require("../assets/city_wallpapers/baltimore_maryland.png"),
  billings_montana: require("../assets/city_wallpapers/billings_montana.png"),
  birmingham_alabama: require("../assets/city_wallpapers/birmingham_alabama.png"),
  boise_idaho: require("../assets/city_wallpapers/boise_idaho.png"),
  boston_massachusetts: require("../assets/city_wallpapers/boston_massachusetts.png"),
  bridgeport_connecticut: require("../assets/city_wallpapers/bridgeport_connecticut.png"),
  burlington_vermont: require("../assets/city_wallpapers/burlington_vermont.png"),
  charleston_south_carolina: require("../assets/city_wallpapers/charleston_south_carolina.png"),
  charleston_west_virginia: require("../assets/city_wallpapers/charleston_west_virginia.png"),
  charlotte_north_carolina: require("../assets/city_wallpapers/charlotte_north_carolina.png"),
  cheyenne_wyoming: require("../assets/city_wallpapers/cheyenne_wyoming.png"),
  chicago_illinois: require("../assets/city_wallpapers/chicago_illinois.png"),
  columbus_ohio: require("../assets/city_wallpapers/columbus_ohio.png"),
  delhi_india: require("../assets/city_wallpapers/delhi_india.png"),
  denver_colorado: require("../assets/city_wallpapers/denver_colorado.png"),
  des_moines_iowa: require("../assets/city_wallpapers/des_moines_iowa.png"),
  detroit_michigan: require("../assets/city_wallpapers/detroit_michigan.png"),
  fargo_north_dakota: require("../assets/city_wallpapers/fargo_north_dakota.png"),
  florianopolis_brazil: require("../assets/city_wallpapers/florianopolis_brazil.png"),
  frankfurt_germany: require("../assets/city_wallpapers/frankfurt_germany.png"),
  honolulu_hawaii: require("../assets/city_wallpapers/honolulu_hawaii.png"),
  houston_texas: require("../assets/city_wallpapers/houston_texas.png"),
  indianapolis_indiana: require("../assets/city_wallpapers/indianapolis_indiana.png"),
  jackson_mississippi: require("../assets/city_wallpapers/jackson_mississippi.png"),
  jacksonville_florida: require("../assets/city_wallpapers/jacksonville_florida.png"),
  kansas_city_missouri: require("../assets/city_wallpapers/kansas_city_missouri.png"),
  krakow_poland: require("../assets/city_wallpapers/krakow_poland.png"),
  las_vegas_nevada: require("../assets/city_wallpapers/las_vegas_nevada.png"),
  little_rock_arkansas: require("../assets/city_wallpapers/little_rock_arkansas.png"),
  london_uk: require("../assets/city_wallpapers/london_uk.png"),
  los_angeles_california: require("../assets/city_wallpapers/los_angeles_california.png"),
  louisville_kentucky: require("../assets/city_wallpapers/louisville_kentucky.png"),
  manchester_new_hampshire: require("../assets/city_wallpapers/manchester_new_hampshire.png"),
  milwaukee_wisconsin: require("../assets/city_wallpapers/milwaukee_wisconsin.png"),
  minneapolis_minnesota: require("../assets/city_wallpapers/minneapolis_minnesota.png"),
  nashville_tennessee: require("../assets/city_wallpapers/nashville_tennessee.png"),
  new_orleans_louisiana: require("../assets/city_wallpapers/new_orleans_louisiana.png"),
  new_york_city: require("../assets/city_wallpapers/new_york_city.png"),
  newark_new_jersey: require("../assets/city_wallpapers/newark_new_jersey.png"),
  oklahoma_city_oklahoma: require("../assets/city_wallpapers/oklahoma_city_oklahoma.png"),
  omaha_nebraska: require("../assets/city_wallpapers/omaha_nebraska.png"),
  oslo_norway: require("../assets/city_wallpapers/oslo_norway.png"),
  palo_alto_california: require("../assets/city_wallpapers/palo_alto_california.png"),
  philadelphia_pennsylvania: require("../assets/city_wallpapers/philadelphia_pennsylvania.png"),
  phoenix_arizona: require("../assets/city_wallpapers/phoenix_arizona.png"),
  portland_maine: require("../assets/city_wallpapers/portland_maine.png"),
  portland_oregon: require("../assets/city_wallpapers/portland_oregon.png"),
  prague_czech_republic: require("../assets/city_wallpapers/prague_czech_republic.png"),
  providence_rhode_island: require("../assets/city_wallpapers/providence_rhode_island.png"),
  salt_lake_city_utah: require("../assets/city_wallpapers/salt_lake_city_utah.png"),
  seattle_washington: require("../assets/city_wallpapers/seattle_washington.png"),
  sioux_falls_south_dakota: require("../assets/city_wallpapers/sioux_falls_south_dakota.png"),
  taipei_taiwan: require("../assets/city_wallpapers/taipei_taiwan.png"),
  vancouver_canada: require("../assets/city_wallpapers/vancouver_canada.png"),
  virginia_beach_virginia: require("../assets/city_wallpapers/virginia_beach_virginia.png"),
  wichita_kansas: require("../assets/city_wallpapers/wichita_kansas.png"),
  wilmington_delaware: require("../assets/city_wallpapers/wilmington_delaware.png"),
};

// Default fallback city (New York)
export const DEFAULT_CITY = CITY_COORDINATES.find(c => c.imageKey === "new_york_city")!;

// Calculate distance between two points using Haversine formula
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find the nearest city to given coordinates
export function findNearestCity(lat: number, lng: number): CityData {
  let nearest = DEFAULT_CITY;
  let minDistance = Infinity;

  for (const city of CITY_COORDINATES) {
    const distance = haversineDistance(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  }

  return nearest;
}

// Get the image source for a city
export function getCityImage(imageKey: string): any {
  return CITY_IMAGES[imageKey] || CITY_IMAGES[DEFAULT_CITY.imageKey];
}
