// Centralized query key factory for consistent cache keys

export const queryKeys = {
  // Auth
  auth: {
    profile: () => ["auth", "profile"] as const,
  },
  // Dashboard
  dashboard: {
    stats: () => ["dashboard", "stats"] as const,
    recentActivity: () => ["dashboard", "recent-activity"] as const,
  },
  // Products
  products: {
    all: () => ["products"] as const,
    list: (params?: object) => ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    categories: () => ["products", "categories"] as const,
  },
  // Inventory
  inventory: {
    summary: (locationId?: string) =>
      ["inventory", "summary", locationId] as const,
    movements: (params?: object) => ["inventory", "movements", params] as const,
    opname: (id?: string) => ["inventory", "opname", id] as const,
  },
  // Barcode
  barcode: {
    jobs: () => ["barcode", "jobs"] as const,
  },
  // Notifications
  notifications: {
    all: (params?: object) => ["notifications", params] as const,
    unread: () => ["notifications", "unread"] as const,
  },
  // Suppliers
  suppliers: {
    list: (params?: object) => ["suppliers", "list", params] as const,
    detail: (id: string) => ["suppliers", "detail", id] as const,
    priceHistory: (productId: string) =>
      ["suppliers", "price-history", productId] as const,
  },
  // Purchase Orders
  purchaseOrders: {
    list: (params?: object) => ["purchase-orders", "list", params] as const,
    detail: (id: string) => ["purchase-orders", "detail", id] as const,
  },
  // Reports
  reports: {
    stock: (params?: object) => ["reports", "stock", params] as const,
    movement: (params?: object) => ["reports", "movement", params] as const,
    purchases: (params?: object) => ["reports", "purchases", params] as const,
    expired: (params?: object) => ["reports", "expired", params] as const,
  },
  // Users
  users: {
    list: (params?: object) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    activityLog: (userId: string) => ["users", "activity-log", userId] as const,
  },
  // Settings
  settings: {
    business: () => ["settings", "business"] as const,
    locations: () => ["settings", "locations"] as const,
    units: () => ["settings", "units"] as const,
    categories: () => ["settings", "categories"] as const,
  },
};
