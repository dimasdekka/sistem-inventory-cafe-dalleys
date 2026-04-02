import { lazy } from "react";

// Auth
export const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);

// Dashboard
export const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);

// Products
export const ProductListPage = lazy(() =>
  import("@/features/products/pages/ProductListPage").then((m) => ({
    default: m.ProductListPage,
  })),
);
export const ProductDetailPage = lazy(() =>
  import("@/features/products/pages/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
export const ProductFormPage = lazy(() =>
  import("@/features/products/pages/ProductFormPage").then((m) => ({
    default: m.ProductFormPage,
  })),
);
export const ProductPrintBarcodePage = lazy(() =>
  import("@/features/products/pages/ProductPrintBarcodePage").then((m) => ({
    default: m.ProductPrintBarcodePage,
  })),
);

// Inventory
export const StockSummaryPage = lazy(() =>
  import("@/features/inventory/pages/StockSummaryPage").then((m) => ({
    default: m.StockSummaryPage,
  })),
);
export const StockInPage = lazy(() =>
  import("@/features/inventory/pages/StockInPage").then((m) => ({
    default: m.StockInPage,
  })),
);
export const StockOutPage = lazy(() =>
  import("@/features/inventory/pages/StockOutPage").then((m) => ({
    default: m.StockOutPage,
  })),
);
export const StockAdjustmentPage = lazy(() =>
  import("@/features/inventory/pages/StockAdjustmentPage").then((m) => ({
    default: m.StockAdjustmentPage,
  })),
);
export const StockOpnamePage = lazy(() =>
  import("@/features/inventory/pages/StockOpnamePage").then((m) => ({
    default: m.StockOpnamePage,
  })),
);

// Suppliers
export const SupplierListPage = lazy(() =>
  import("@/features/suppliers/pages").then((m) => ({
    default: m.SupplierListPage,
  })),
);
export const SupplierDetailPage = lazy(() =>
  import("@/features/suppliers/pages").then((m) => ({
    default: m.SupplierDetailPage,
  })),
);

// Purchase Orders
export const PurchaseOrderListPage = lazy(() =>
  import("@/features/purchase-orders/pages").then((m) => ({
    default: m.PurchaseOrderListPage,
  })),
);
export const PurchaseOrderDetailPage = lazy(() =>
  import("@/features/purchase-orders/pages").then((m) => ({
    default: m.PurchaseOrderDetailPage,
  })),
);
export const PurchaseOrderFormPage = lazy(() =>
  import("@/features/purchase-orders/pages").then((m) => ({
    default: m.PurchaseOrderFormPage,
  })),
);

// Reports (Expired report removed)
export const StockReportPage = lazy(() =>
  import("@/features/reports/pages").then((m) => ({
    default: m.StockReportPage,
  })),
);
export const MovementReportPage = lazy(() =>
  import("@/features/reports/pages").then((m) => ({
    default: m.MovementReportPage,
  })),
);
export const PurchaseReportPage = lazy(() =>
  import("@/features/reports/pages").then((m) => ({
    default: m.PurchaseReportPage,
  })),
);

// Users & Profile
export const UserListPage = lazy(() =>
  import("@/features/users/pages/UserListPage").then((m) => ({
    default: m.UserListPage,
  })),
);
export const ProfilePage = lazy(() =>
  import("@/features/users/pages/UserListPage").then((m) => ({
    default: m.ProfilePage,
  })),
);

// Settings
export const SettingsLayout = lazy(() =>
  import("@/features/settings/pages/SettingsLayout").then((m) => ({
    default: m.SettingsLayout,
  })),
);
export const BusinessProfilePage = lazy(() =>
  import("@/features/settings/pages/SettingsLayout").then((m) => ({
    default: m.BusinessProfilePage,
  })),
);
export const UnitsPage = lazy(() =>
  import("@/features/settings/pages/SettingsLayout").then((m) => ({
    default: m.UnitsPage,
  })),
);
export const CategoriesPage = lazy(() =>
  import("@/features/settings/pages/SettingsLayout").then((m) => ({
    default: m.CategoriesPage,
  })),
);
export const ScannerSettingsPage = lazy(() =>
  import("@/features/settings/pages").then((m) => ({
    default: m.ScannerSettingsPage,
  })),
);

// Notifications
export const NotificationsPage = lazy(() =>
  import("@/features/notifications/pages").then((m) => ({
    default: m.NotificationsPage,
  })),
);

// Barcode
export const BarcodeScannerPage = lazy(() =>
  import("@/features/barcode/pages").then((m) => ({
    default: m.BarcodeScannerPage,
  })),
);
