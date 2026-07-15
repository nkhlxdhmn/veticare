import { api } from "@/lib/api";

type NearbyPlace = {
  name: string;
  vicinity: string;
  rating: number | null;
  place_id: string;
  types: string[];
  geometry: { lat: number; lng: number };
};

export const servicesService = {
  async nearby(lat: number, lng: number, radius = 5000): Promise<NearbyPlace[]> {
    const res = await api.get<{ services: NearbyPlace[]; count: number }>(
      `/services/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`,
    );
    return res.services;
  },
};
