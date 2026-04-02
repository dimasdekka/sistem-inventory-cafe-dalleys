import { apiClient } from "@/lib/api-client";
import { Product } from "../products/products.service";

export interface StockSummary {
  id: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface StockLedger {
  id: string;
  productId: string;
  movementType: string;
  quantity: number;
  referenceNo?: string;
  notes?: string;
  product?: Product;
  createdAt: string;
  created_by_name?: string;
}

export interface StockOutRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  referenceNo?: string;
  notes?: string;
}

export interface StockInRequest {
  items: Array<{
    productId: string;
    quantity: number;
    unit_cost?: number;  // harga beli satuan sebelum pajak
    tax_pct?: number;    // persentase pajak (0-100)
  }>;
  referenceNo?: string;
  notes?: string;
}

export interface StockAdjustmentRequest {
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockOpnameRequest {
  productId: string;
  actualQuantity: number;
  notes?: string;
}

export const inventoryService = {
  getSummaries: async (): Promise<StockSummary[]> => {
    const response = await apiClient.get<{ data: any[] }>("/inventory/summary");
    return (response.data.data || []).map((item) => ({
      id: `${item.product_id}`,
      productId: item.product_id,
      quantity: item.quantity,
      product: item.product,
    }));
  },

  getLedgers: async (productId?: string): Promise<StockLedger[]> => {
    const url = productId
      ? `/inventory/movements?product_id=${productId}`
      : "/inventory/movements";
    const response = await apiClient.get<{ data: any[] }>(url);
    return (response.data.data || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      movementType: item.type,
      quantity: item.quantity,
      referenceNo: item.reference_no,
      notes: item.notes,
      product: item.product,
      createdAt: item.created_at,
      created_by_name: item.created_by_name,
    }));
  },

  stockIn: async (data: StockInRequest): Promise<void> => {
    await apiClient.post("/inventory/stock-in", {
      items: data.items.map((item) => ({
        product_id: item.productId,
        quantity:   item.quantity,
        unit_cost:  item.unit_cost ?? 0,
        tax_pct:    item.tax_pct ?? 0,
      })),
      reference_no: data.referenceNo,
      notes: data.notes,
    });
  },

  stockOut: async (data: StockOutRequest): Promise<void> => {
    await apiClient.post("/inventory/stock-out", {
      items: data.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      reference_no: data.referenceNo,
      notes: data.notes,
    });
  },

  stockAdjustment: async (data: StockAdjustmentRequest): Promise<void> => {
    await apiClient.post("/inventory/adjustment", {
      product_id: data.productId,
      quantity: data.quantity,
      notes: data.notes,
    });
  },

  stockOpname: async (data: StockOpnameRequest): Promise<void> => {
    await apiClient.post("/inventory/opname", {
      product_id: data.productId,
      actual_quantity: data.actualQuantity,
      notes: data.notes,
    });
  },
};
