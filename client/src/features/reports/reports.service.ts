import { apiClient } from "@/lib/api-client";

export interface DashboardKPI {
  total_products: number;
  total_stock_value: number;
  low_stock_count: number;
  critical_count: number;
  out_of_stock_count: number;
  today_in: number;
  today_out: number;
}

export interface StockReportItem {
  product_id: string;
  product_name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  total_value: number;
  min_stock: number;
  status: "ok" | "low" | "critical" | "out";
}

export interface MovementReportItem {
  id: string;
  date: string;
  product_name: string;
  sku: string;
  type: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  notes: string;
  reference_no: string;
  created_by: string;
}

export interface PurchaseReportItem {
  id: string;
  po_number: string;
  supplier: string;
  total: number;
  status: string;
  created_at: string;
  item_count: number;
}

export const reportsService = {
  async getDashboard(): Promise<DashboardKPI> {
    const res = await apiClient.get("/reports/dashboard");
    return res.data.data;
  },

  async getStockReport(): Promise<StockReportItem[]> {
    const res = await apiClient.get("/reports/stock");
    return res.data.data ?? [];
  },

  async getMovementReport(): Promise<MovementReportItem[]> {
    const res = await apiClient.get("/reports/movements");
    return res.data.data ?? [];
  },

  async getPurchaseReport(): Promise<PurchaseReportItem[]> {
    const res = await apiClient.get("/reports/purchases");
    return res.data.data ?? [];
  },

  /**
   * Export any array of objects to a CSV file and trigger browser download.
   */
  exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
  ): void {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            const str = val == null ? "" : String(val);
            // Escape fields that contain commas, quotes, or newlines
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(","),
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
