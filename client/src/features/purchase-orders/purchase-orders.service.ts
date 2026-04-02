import { apiClient } from "@/lib/api-client";
import { Supplier } from "@/features/suppliers/suppliers.service";
import { Product } from "@/features/products/products.service";

export interface PurchaseOrderItemResponse {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_cost: number;
  tax_percentage: number;
  tax_amount: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier: Supplier;
  status: "draft" | "pending" | "completed" | "cancelled";
  notes: string;
  tax_percentage: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: PurchaseOrderItemResponse[];
}

export interface PurchaseOrderItemRequest {
  product_id: string;
  quantity: number;
  unit_cost: number;
}

export interface CreatePurchaseOrderDto {
  supplier_id: string;
  notes: string;
  items: PurchaseOrderItemRequest[];
}

export const purchaseOrdersService = {
  getAll: async () => {
    const response = await apiClient.get<{ data: PurchaseOrder[] }>(
      "/purchase-orders",
    );
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: PurchaseOrder }>(
      `/purchase-orders/${id}`,
    );
    return response.data.data;
  },

  getHistory: async (id: string) => {
    // History endpoint returns Activity Logs array
    const response = await apiClient.get<{ data: any[] }>(
      `/purchase-orders/${id}/history`,
    );
    return response.data.data;
  },

  getBySupplierId: async (supplierId: string) => {
    const response = await apiClient.get<{ data: PurchaseOrder[] }>(
      `/purchase-orders?supplier_id=${supplierId}`,
    );
    return response.data.data;
  },

  create: async (data: CreatePurchaseOrderDto) => {
    const response = await apiClient.post<{ data: PurchaseOrder }>(
      "/purchase-orders",
      data,
    );
    return response.data.data;
  },

  update: async (id: string, data: CreatePurchaseOrderDto) => {
    const response = await apiClient.put<{ data: PurchaseOrder }>(
      `/purchase-orders/${id}`,
      data,
    );
    return response.data.data;
  },

  updateStatus: async (id: string, status: string) => {
    const payload: any = { status };
    const response = await apiClient.put<{ data: PurchaseOrder }>(
      `/purchase-orders/${id}/status`,
      payload,
    );
    return response.data.data;
  },
};
