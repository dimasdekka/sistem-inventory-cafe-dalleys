import { apiClient } from "@/lib/api-client";

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string | null;
  createdAt: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  createdAt: string;
}

export const masterDataService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<{ data: Category[] }>("/categories");
    return response.data.data;
  },

  getUnits: async (): Promise<Unit[]> => {
    const response = await apiClient.get<{ data: Unit[] }>("/units");
    return response.data.data;
  },

  // Units
  createUnit: async (payload: {
    name: string;
    symbol: string;
    description?: string;
  }): Promise<void> => {
    await apiClient.post("/units", payload);
  },
  updateUnit: async (
    id: string,
    payload: { name?: string; symbol?: string; description?: string },
  ): Promise<void> => {
    await apiClient.put(`/units/${id}`, payload);
  },
  deleteUnit: async (id: string): Promise<void> => {
    await apiClient.delete(`/units/${id}`);
  },

  // Categories
  createCategory: async (payload: {
    name: string;
    description?: string;
    parentId?: string | null;
  }): Promise<void> => {
    await apiClient.post("/categories", {
      name: payload.name,
      description: payload.description ?? "",
      parent_id: payload.parentId ?? null,
    });
  },
  updateCategory: async (
    id: string,
    payload: { name?: string; description?: string; parentId?: string | null },
  ): Promise<void> => {
    await apiClient.put(`/categories/${id}`, {
      name: payload.name,
      description: payload.description ?? "",
      parent_id: payload.parentId ?? null,
    });
  },
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
