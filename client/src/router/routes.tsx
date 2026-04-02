import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthGuard } from "./guards/AuthGuard";
import { RoleGuard } from "./guards/RoleGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/constants";
import * as Lazy from "./lazy-routes";

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Spinner size="lg" />
  </div>
);

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

export const routes = [
  // ── Public routes ─────────────────────────────────────────
  {
    element: (
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    ),
    children: [
      {
        path: ROUTES.LOGIN,
        element: (
          <SuspenseWrapper>
            <Lazy.LoginPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // ── Protected routes ──────────────────────────────────────
  {
    element: (
      <AuthGuard>
        <AppLayout>
          <SuspenseWrapper>
            <Outlet />
          </SuspenseWrapper>
        </AppLayout>
      </AuthGuard>
    ),
    children: [
      // Dashboard
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      {
        path: ROUTES.HOME,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      { path: ROUTES.DASHBOARD, element: <Lazy.DashboardPage /> },

      // Products
      {
        path: ROUTES.PRODUCTS.LIST,
        element: (
          <RoleGuard requiredPermission="products:read">
            <Lazy.ProductListPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.PRODUCTS.NEW,
        element: (
          <RoleGuard requiredPermission="products:write">
            <Lazy.ProductFormPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.PRODUCTS.DETAIL(":id"),
        element: (
          <RoleGuard requiredPermission="products:read">
            <Lazy.ProductDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.PRODUCTS.EDIT(":id"),
        element: (
          <RoleGuard requiredPermission="products:write">
            <Lazy.ProductFormPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.PRODUCTS.PRINT_BARCODE(":id"),
        element: (
          <RoleGuard requiredPermission="barcode:print">
            <Lazy.ProductPrintBarcodePage />
          </RoleGuard>
        ),
      },

      // Inventory
      {
        path: ROUTES.INVENTORY.SUMMARY,
        element: (
          <RoleGuard requiredPermission="inventory:read">
            <Lazy.StockSummaryPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.INVENTORY.STOCK_IN,
        element: (
          <RoleGuard requiredPermission="inventory:write">
            <Lazy.StockInPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.INVENTORY.STOCK_OUT,
        element: (
          <RoleGuard requiredPermission="inventory:write">
            <Lazy.StockOutPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.INVENTORY.ADJUSTMENT,
        element: (
          <RoleGuard requiredPermission="inventory:approve">
            <Lazy.StockAdjustmentPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.INVENTORY.STOCK_TAKING,
        element: (
          <RoleGuard requiredPermission="inventory:write">
            <Lazy.StockOpnamePage />
          </RoleGuard>
        ),
      },

      // Suppliers
      {
        path: ROUTES.SUPPLIERS.LIST,
        element: (
          <RoleGuard requiredPermission="suppliers:read">
            <Lazy.SupplierListPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.SUPPLIERS.DETAIL(":id"),
        element: (
          <RoleGuard requiredPermission="suppliers:read">
            <Lazy.SupplierDetailPage />
          </RoleGuard>
        ),
      },

      // Purchase Orders
      {
        path: ROUTES.PURCHASE_ORDERS.LIST,
        element: (
          <RoleGuard requiredPermission="po:read">
            <Lazy.PurchaseOrderListPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.PURCHASE_ORDERS.NEW,
        element: (
          <RoleGuard requiredPermission="po:create">
            <Lazy.PurchaseOrderFormPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.PURCHASE_ORDERS.EDIT(":id"),
        element: (
          <RoleGuard requiredPermission="po:create">
            <Lazy.PurchaseOrderFormPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.PURCHASE_ORDERS.DETAIL(":id"),
        element: (
          <RoleGuard requiredPermission="po:read">
            <Lazy.PurchaseOrderDetailPage />
          </RoleGuard>
        ),
      },

      // Reports (Expired report removed)
      {
        path: ROUTES.REPORTS.STOCK,
        element: (
          <RoleGuard requiredPermission="reports:basic">
            <Lazy.StockReportPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.REPORTS.MOVEMENT,
        element: (
          <RoleGuard requiredPermission="reports:basic">
            <Lazy.MovementReportPage />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.REPORTS.PURCHASES,
        element: (
          <RoleGuard requiredPermission="reports:full">
            <Lazy.PurchaseReportPage />
          </RoleGuard>
        ),
      },

      // Users
      {
        path: ROUTES.SETTINGS.USERS,
        element: (
          <RoleGuard requiredPermission="users:read">
            <Lazy.UserListPage />
          </RoleGuard>
        ),
      },

      // Profile & Settings
      { path: ROUTES.PROFILE, element: <Lazy.ProfilePage /> },

      // Settings (Config)
      {
        path: "/settings",
        element: (
          <RoleGuard requiredPermission="settings:read">
            <Lazy.SettingsLayout />
          </RoleGuard>
        ),
        children: [
          { path: "profile", element: <Lazy.BusinessProfilePage /> },
          { path: "categories", element: <Lazy.CategoriesPage /> },
          { path: "units", element: <Lazy.UnitsPage /> },
          { path: "scanner", element: <Lazy.ScannerSettingsPage /> },
        ],
      },

      // Notifications
      {
        path: ROUTES.NOTIFICATIONS,
        element: (
          <RoleGuard requiredPermission="notifications:all">
            <Lazy.NotificationsPage />
          </RoleGuard>
        ),
      },

      // Barcode Scanner
      {
        path: ROUTES.BARCODE.SCANNER,
        element: (
          <RoleGuard requiredPermission="barcode:scan">
            <Lazy.BarcodeScannerPage />
          </RoleGuard>
        ),
      },

      // 404
      { path: "*", element: <Navigate to={ROUTES.DASHBOARD} replace /> },
    ],
  },
];
