import { api } from "@/lib/api";
import type { Pet } from "@/data/pets";

type BackendPet = {
  id: string;
  owner_id: string;
  animal_id: string | null;
  name: string;
  breed: string | null;
  dob: string | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  color: string | null;
  microchip_number: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  animal: { id: string; name: string; scientific_name: string | null } | null;
};

function mapPet(r: BackendPet): Pet {
  return {
    id: r.id,
    name: r.name,
    animal: r.animal?.name ?? "",
    breed: r.breed ?? "",
    gender: r.gender ?? "",
    age: "",
    dob: r.dob ?? "",
    weight: r.weight?.toString() ?? "",
    height: r.height?.toString() ?? "",
    color: r.color ?? "",
    photo: r.image_url ?? "",
    owner: "",
    vaccinationStatus: 0,
    healthStatus: "Healthy",
    notes: r.notes ? [r.notes] : [],
    allergies: "",
    medications: "",
    predictionHistory: [],
    medicalHistory: [],
  };
}

export const petsService = {
  async list(offset = 0, limit = 20): Promise<Pet[]> {
    const raw = await api.get<BackendPet[]>(`/pets?offset=${offset}&limit=${limit}`);
    return raw.map(mapPet);
  },

  async get(id: string): Promise<Pet> {
    const raw = await api.get<BackendPet>(`/pets/${id}`);
    return mapPet(raw);
  },

  async create(data: { name: string; breed?: string; gender?: string; dob?: string; weight?: number; height?: number; color?: string; notes?: string }): Promise<Pet> {
    const raw = await api.post<BackendPet>("/pets", data);
    return mapPet(raw);
  },

  async update(id: string, data: Partial<{ name: string; breed: string; gender: string; dob: string; weight: number; height: number; color: string; notes: string }>): Promise<Pet> {
    const raw = await api.patch<BackendPet>(`/pets/${id}`, data);
    return mapPet(raw);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/pets/${id}`);
  },
};
