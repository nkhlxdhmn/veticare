/**
 * AI Prediction API service. Predict, history, and detail retrieval.
 */
import api from '@/lib/axios';
import type {
  PredictionDetail,
  PredictionHistoryItem,
  PredictionRequestPayload,
  PredictionResult,
} from '@/types';

export const predictionService = {
  predict: async (payload: PredictionRequestPayload): Promise<PredictionResult> => {
    const { data } = await api.post<PredictionResult>('/predictions', payload);
    return data;
  },

  getHistory: async (): Promise<PredictionHistoryItem[]> => {
    const { data } = await api.get<PredictionHistoryItem[]>('/predictions');
    return data;
  },

  getById: async (id: string): Promise<PredictionDetail> => {
    const { data } = await api.get<PredictionDetail>(`/predictions/${id}`);
    return data;
  },
};
