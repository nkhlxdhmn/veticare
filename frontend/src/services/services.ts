import { api } from "@/lib/api";

export type NearbyPlace = {
  osm_id: number | null;
  osm_type: string | null;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  type_label: string;
  phone: string;
  website: string;
  opening_hours: string;
  distance: number | null;
};

export type SearchResult = {
  osm_id: number | null;
  osm_type: string | null;
  name: string;
  display_name: string;
  lat: number;
  lng: number;
  type: string;
  category: string;
};

export type GeocodeResult = {
  osm_id: number | null;
  osm_type: string | null;
  display_name: string;
  lat: number;
  lng: number;
  address: Record<string, string>;
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data as T;
  cache.delete(key);
  return null;
}

function cacheSet(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

export const servicesService = {
  async search(query: string, limit = 5): Promise<SearchResult[]> {
    const cacheKey = `search:${query}:${limit}`;
    const cached = cacheGet<SearchResult[]>(cacheKey);
    if (cached) return cached;

    const res = await api.get<{ results: SearchResult[]; count: number }>(
      `/maps/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    cacheSet(cacheKey, res.results);
    return res.results;
  },

  async nearby(
    lat: number,
    lng: number,
    radius = 5000,
    placeType?: string,
  ): Promise<NearbyPlace[]> {
    const cacheKey = `nearby:${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}:${placeType ?? ""}`;
    const cached = cacheGet<NearbyPlace[]>(cacheKey);
    if (cached) return cached;

    let path =
      `/maps/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`;
    if (placeType) path += `&place_type=${encodeURIComponent(placeType)}`;

    const data = await withRetry(async () =>
      api.get<{ places: NearbyPlace[]; count: number }>(path),
    );
    cacheSet(cacheKey, data.places);
    return data.places;
  },

  async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<GeocodeResult | null> {
    const cacheKey = `geocode:${lat.toFixed(4)}:${lng.toFixed(4)}`;
    const cached = cacheGet<GeocodeResult | null>(cacheKey);
    if (cached !== null) return cached;

    const res = await api.get<{ result: GeocodeResult | null }>(
      `/maps/geocode?lat=${lat}&lng=${lng}`,
    );
    cacheSet(cacheKey, res.result);
    return res.result;
  },
};
