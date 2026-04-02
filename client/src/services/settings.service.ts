import { apiClient } from "@/lib/api-client";

export interface SettingResponse {
  id: string;
  value: Record<string, any>;
  updated_at: string;
  updated_by?: string;
}

export const settingsService = {
  getAll: async (): Promise<SettingResponse[]> => {
    const res = await apiClient.get("/settings");
    return res.data.data;
  },
  getById: async (id: string): Promise<SettingResponse> => {
    const res = await apiClient.get(`/settings/${id}`);
    return res.data.data;
  },
  save: async (id: string, value: Record<string, any>): Promise<void> => {
    await apiClient.put(`/settings/${id}`, { value });
  },
};
