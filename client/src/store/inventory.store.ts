import { create } from "zustand";

interface StockCache {
  productId: string;
  locationId: string;
  quantity: number;
  lastUpdated: string;
}

interface InventoryFilters {
  search: string;
  categoryId: string | null;
  locationId: string | null;
  status: "all" | "low" | "critical" | "out" | "ok";
}

interface InventoryStore {
  activeLocationId: string | null;
  stockCache: Record<string, StockCache>;
  filters: InventoryFilters;
  setActiveLocation: (locationId: string | null) => void;
  updateStockCache: (entry: StockCache) => void;
  clearStockCache: () => void;
  setFilters: (filters: Partial<InventoryFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: InventoryFilters = {
  search: "",
  categoryId: null,
  locationId: null,
  status: "all",
};

export const useInventoryStore = create<InventoryStore>((set) => ({
  activeLocationId: null,
  stockCache: {},
  filters: defaultFilters,

  setActiveLocation: (locationId) => set({ activeLocationId: locationId }),

  updateStockCache: (entry) =>
    set((state) => ({
      stockCache: {
        ...state.stockCache,
        [`${entry.productId}_${entry.locationId}`]: entry,
      },
    })),

  clearStockCache: () => set({ stockCache: {} }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: defaultFilters }),
}));
