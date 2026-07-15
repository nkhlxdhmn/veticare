import { api } from "@/lib/api";
import type { Disease } from "@/data/predictions";

type BackendPrediction = {
  id: string;
  pet_id: string;
  predicted_disease: string;
  confidence: number;
  model_version: string;
  prediction_json: Record<string, unknown>;
  created_at: string;
};

export const predictionsService = {
  async listByPet(petId: string): Promise<BackendPrediction[]> {
    return api.get<BackendPrediction[]>(`/predictions/${petId}`);
  },

  async predict(petId: string, animalName: string, symptoms: string[]): Promise<Disease> {
    const raw = await api.post<BackendPrediction>("/predictions/predict", {
      pet_id: petId,
      animal_name: animalName,
      symptoms,
    });

    return {
      id: raw.id,
      name: raw.predicted_disease,
      description: "",
      causes: "",
      symptoms,
      medication: "",
      diet: "",
      care: "",
      severity: raw.confidence >= 0.7 ? "high" : raw.confidence >= 0.4 ? "moderate" : "low",
      confidence: raw.confidence,
      treatment: "",
      recovery: "",
    };
  },
};
