import { api } from "@/lib/api";
import type { Vaccination } from "@/data/vaccinations";

type BackendVaccination = {
  id: string;
  pet_id: string;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string | null;
  dose: string | null;
  clinic_name: string | null;
  veterinarian: string | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
};

function mapVax(r: BackendVaccination): Vaccination {
  const now = new Date();
  const due = r.next_due_date ? new Date(r.next_due_date) : null;
  let status: Vaccination["status"] = "Completed";
  if (due && due < now) status = "Overdue";
  else if (due && due > now) status = "Upcoming";

  return {
    id: r.id,
    petId: r.pet_id,
    petName: "",
    vaccine: r.vaccine_name,
    dose: r.dose ?? "",
    dateGiven: r.vaccination_date,
    nextDue: r.next_due_date ?? "",
    status,
    clinic: r.clinic_name ?? "",
    veterinarian: r.veterinarian ?? "",
    notes: r.notes ?? "",
    certificate: r.certificate_url ?? "",
  };
}

export const vaccinationsService = {
  async listByPet(petId: string, offset = 0, limit = 20): Promise<Vaccination[]> {
    const raw = await api.get<BackendVaccination[]>(`/vaccinations/${petId}?offset=${offset}&limit=${limit}`);
    return raw.map(mapVax);
  },

  async create(data: {
    pet_id: string;
    vaccine_name: string;
    vaccination_date: string;
    next_due_date?: string;
    dose?: string;
    clinic_name?: string;
    veterinarian?: string;
    notes?: string;
  }): Promise<Vaccination> {
    const raw = await api.post<BackendVaccination>("/vaccinations", data);
    return mapVax(raw);
  },

  async update(id: string, data: Partial<{
    vaccine_name: string;
    vaccination_date: string;
    next_due_date: string;
    dose: string;
    clinic_name: string;
    veterinarian: string;
    notes: string;
  }>): Promise<Vaccination> {
    const raw = await api.patch<BackendVaccination>(`/vaccinations/${id}`, data);
    return mapVax(raw);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/vaccinations/${id}`);
  },
};
