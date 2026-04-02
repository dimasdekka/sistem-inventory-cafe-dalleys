export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PRODUCTS: {
    LIST: "/products",
    NEW: "/products/new",
    DETAIL: (id: string) => `/products/${id}`,
    EDIT: (id: string) => `/products/${id}/edit`,
    PRINT_BARCODE: (id: string) => `/products/${id}/print-barcode`,
  },
  INVENTORY: {
    SUMMARY: "/inventory",
    STOCK_IN: "/inventory/stock-in",
    STOCK_OUT: "/inventory/stock-out",
    ADJUSTMENT: "/inventory/adjustment",
    STOCK_TAKING: "/inventory/stock-taking",
  },
  BARCODE: {
    SCANNER: "/barcode",
    PRINT: "/barcode/print",
  },
  SUPPLIERS: {
    LIST: "/suppliers",
    DETAIL: (id: string) => `/suppliers/${id}`,
  },
  PURCHASE_ORDERS: {
    LIST: "/purchase-orders",
    NEW: "/purchase-orders/new",
    EDIT: (id: string) => `/purchase-orders/${id}/edit`,
    DETAIL: (id: string) => `/purchase-orders/${id}`,
  },
  REPORTS: {
    STOCK: "/reports/stock",
    MOVEMENT: "/reports/movement",
    PURCHASES: "/reports/purchases",
  },
  SETTINGS: {
    PROFILE: "/settings/profile",
    USERS: "/settings/users",
    CATEGORIES: "/settings/categories",
    UNITS: "/settings/units",
    SCANNER: "/settings/scanner",
  },
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
} as const;
