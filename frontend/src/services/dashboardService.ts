import { api } from "@/lib/api";
import type { Pet } from "@/data/pets";
import type { Vaccination } from "@/data/vaccinations";

type PetsResponse = Array<{
  id: string;
  name: string;
  breed: string | null;
  owner_id: string;
  created_at: string;
}>;

type VaccinationResponse = Array<{
  id: string;
  pet_id: string;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string | null;
}>;

function mapPet(raw: PetsResponse[number]): Pet {
  return {
    id: raw.id,
    name: raw.name,
    animal: "",
    breed: raw.breed ?? "",
    gender: "",
    age: "",
    dob: "",
    weight: "",
    height: "",
    color: "",
    photo: "",
    owner: "",
    vaccinationStatus: 0,
    healthStatus: "Healthy",
    notes: [],
    allergies: "",
    medications: "",
    predictionHistory: [],
    medicalHistory: [],
  };
}

function mapVaccination(raw: VaccinationResponse[number]): Vaccination {
  const now = new Date();
  const due = raw.next_due_date ? new Date(raw.next_due_date) : null;
  let status: Vaccination["status"] = "Completed";
  if (due && due < now) status = "Overdue";
  else if (due && due > now) status = "Upcoming";

  return {
    id: raw.id,
    petId: raw.pet_id,
    petName: "",
    vaccine: raw.vaccine_name,
    dose: "",
    dateGiven: raw.vaccination_date,
    nextDue: raw.next_due_date ?? "",
    status,
    clinic: "",
    veterinarian: "",
    notes: "",
    certificate: "",
  };
}

export const dashboardService = {
  async getDashboard() {
    const [petsRaw, vaxRaw] = await Promise.all([
      api.get<PetsResponse>("/pets?limit=5"),
      api.get<VaccinationResponse>("/vaccinations?limit=10"),
    ]);
    return {
      pets: petsRaw.map(mapPet),
      vaccinations: vaxRaw.map(mapVaccination),
      insights: [] as string[],
      nearbyClinics: 0,
    };
  },
};
