import { api } from "@/lib/api";

type BackendCareGuide = {
  id: string;
  animal: string;
  disease: string | null;
  diet: string | null;
  dos: string | null;
  donts: string | null;
  medication: string | null;
  warning_signs: string | null;
  recovery_time: string | null;
};

export const careGuidesService = {
  async list(animal?: string, offset = 0, limit = 20): Promise<BackendCareGuide[]> {
    const params = new URLSearchParams();
    if (animal) params.set("animal", animal);
    params.set("offset", offset.toString());
    params.set("limit", limit.toString());
    return api.get<BackendCareGuide[]>(`/care-guides?${params}`);
  },

  async getByDisease(disease: string): Promise<BackendCareGuide> {
    return api.get<BackendCareGuide>(`/care-guides/${encodeURIComponent(disease)}`);
  },
};
