import { api } from "@/lib/api";
import type { Animal } from "@/data/animals";

type BackendAnimal = {
  id: string;
  name: string;
  scientific_name: string | null;
  description: string | null;
  image_url: string | null;
  diet: string | null;
  average_lifespan: string | null;
  vaccination_schedule: Record<string, unknown> | null;
  care_guide: Record<string, unknown> | null;
  created_at: string;
};

function mapAnimal(r: BackendAnimal): Animal {
  return {
    id: r.id,
    name: r.name,
    category: "",
    scientificName: r.scientific_name ?? "",
    description: r.description ?? "",
    image: r.image_url ?? "",
    lifeSpan: r.average_lifespan ?? "",
    weight: "",
    height: "",
    temperament: "",
    diet: r.diet ?? "",
    activityLevel: "",
    overview: r.description ?? "",
    commonDiseases: [],
    vaccination: [],
    nutrition: { feed: [], avoid: [], water: "" },
    careGuide: [],
    breeds: [],
    faq: [],
  };
}

export const animalsService = {
  async list(offset = 0, limit = 20): Promise<Animal[]> {
    const raw = await api.get<BackendAnimal[]>(`/animals?offset=${offset}&limit=${limit}`);
    return raw.map(mapAnimal);
  },

  async get(id: string): Promise<Animal> {
    const raw = await api.get<BackendAnimal>(`/animals/${id}`);
    return mapAnimal(raw);
  },
};
