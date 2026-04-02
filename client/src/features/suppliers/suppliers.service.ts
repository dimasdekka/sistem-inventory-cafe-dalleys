import { apiClient } from "@/lib/api-client";

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type CreateSupplierDto = Omit<
  Supplier,
  "id" | "created_at" | "updated_at"
>;
export type UpdateSupplierDto = Partial<CreateSupplierDto>;

export const suppliersService = {
  getAll: async () => {
    const response = await apiClient.get<{ data: Supplier[] }>(
      "/suppliers",
    );
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: Supplier }>(
      `/suppliers/${id}`,
    );
    return response.data.data;
  },

  create: async (data: FormData) => {
    const response = await apiClient.post<{ data: Supplier }>(
      "/suppliers",
      data,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
  },

  update: async (id: string, data: FormData) => {
    const response = await apiClient.put<{ data: Supplier }>(
      `/suppliers/${id}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};
