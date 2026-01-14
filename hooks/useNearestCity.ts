import { useState, useEffect } from "react";
import { findNearestCity, getCityImage, DEFAULT_CITY, CityData } from "../utils/cityCoordinates";
import * as SecureStore from "expo-secure-store";

const LOCATION_CACHE_KEY = "cached_location";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

interface NearestCityResult {
  city: CityData;
  imageSource: any;
  loading: boolean;
  error: string | null;
}

// Fetch approximate location from IP using ip-api.com (free, no API key needed)
async function fetchIPLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch("http://ip-api.com/json/?fields=lat,lon");
    if (!response.ok) return null;

    const data = await response.json();
    if (data.lat && data.lon) {
      return { lat: data.lat, lng: data.lon };
    }
    return null;
  } catch (error) {
    console.log("IP geolocation failed:", error);
    return null;
  }
}

// Try to get cached location
async function getCachedLocation(): Promise<CachedLocation | null> {
  try {
    const cached = await SecureStore.getItemAsync(LOCATION_CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedLocation = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION_MS;

    return isExpired ? null : parsed;
  } catch {
    return null;
  }
}

// Save location to cache
async function cacheLocation(lat: number, lng: number): Promise<void> {
  try {
    const data: CachedLocation = { lat, lng, timestamp: Date.now() };
    await SecureStore.setItemAsync(LOCATION_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Caching failed, not critical
  }
}

export function useNearestCity(): NearestCityResult {
  const [city, setCity] = useState<CityData>(DEFAULT_CITY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function determineCity() {
      try {
        // First check cache
        const cached = await getCachedLocation();
        if (cached && mounted) {
          const nearest = findNearestCity(cached.lat, cached.lng);
          setCity(nearest);
          setLoading(false);
          return;
        }

        // Fetch from IP
        const location = await fetchIPLocation();

        if (!mounted) return;

        if (location) {
          await cacheLocation(location.lat, location.lng);
          const nearest = findNearestCity(location.lat, location.lng);
          setCity(nearest);
        } else {
          // Use default if IP lookup fails
          setCity(DEFAULT_CITY);
          setError("Could not determine location, using default");
        }
      } catch (e) {
        if (mounted) {
          setCity(DEFAULT_CITY);
          setError("Location error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    determineCity();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    city,
    imageSource: getCityImage(city.imageKey),
    loading,
    error,
  };
}
