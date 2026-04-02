import { apiClient } from "@/lib/api-client";

export interface BarcodeLookupResult {
  id: string;
  code: string;
  barcode: string;
  name: string;
  price: number;
  tax_percentage: number;
  category: string;
  unit_symbol: string;
  stock: number;
}

export const barcodeService = {
  /**
   * Generate a barcode PNG image URL for a product (by ID)
   * Returns a URL that points directly to the backend image endpoint.
   */
  getBarcodeImageUrl(productId: string): string {
    return `${apiClient.defaults.baseURL}/barcode/product/${productId}`;
  },

  /**
   * Lookup a product by its barcode / SKU code
   */
  async lookup(code: string): Promise<BarcodeLookupResult> {
    const res = await apiClient.post("/barcode/lookup", { code });
    return res.data.data;
  },
};

export default barcodeService;
