import { apiClient } from "@/lib/api-client";
import { Category, Unit } from "@/services/master-data.service";

export interface Product {
  id: string;
  code: string;
  name: string;
  barcode?: string;
  description?: string;
  image_url?: string;
  price: number;
  tax_percentage: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  category: Category;
  unit: Unit;
  created_at: string;
}

export const productsService = {
  getProducts: async (): Promise<Product[]> => {
    // we use `data.data` because backend wraps in { message, data }
    const response = await apiClient.get<{ data: Product[] }>("/products");
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  createProduct: async (formData: FormData): Promise<void> => {
    await apiClient.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateProduct: async (id: string, formData: FormData): Promise<void> => {
    await apiClient.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
