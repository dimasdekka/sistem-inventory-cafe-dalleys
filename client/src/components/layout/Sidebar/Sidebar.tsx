import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  WarehouseIcon,
  Truck,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Coffee,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";
import { ROUTES } from "@/constants";
import { usePermission } from "@/features/auth/hooks/usePermission";

interface NavItem {
  label: string;
  icon: React.ElementType;
  to?: string;
  permission?: Parameters<ReturnType<typeof usePermission>["can"]>[0];
  children?: Omit<NavItem, "children" | "icon">[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  {
    label: "Produk",
    icon: Package,
    to: ROUTES.PRODUCTS.LIST,
    permission: "products:read",
  },
  {
    label: "Inventaris",
    icon: WarehouseIcon,
    permission: "inventory:read",
    children: [
      {
        label: "Ringkasan Stok",
        to: ROUTES.INVENTORY.SUMMARY,
        permission: "inventory:read",
      },
      {
        label: "Stok Masuk",
        to: ROUTES.INVENTORY.STOCK_IN,
        permission: "inventory:write",
      },
      {
        label: "Stok Keluar",
        to: ROUTES.INVENTORY.STOCK_OUT,
        permission: "inventory:write",
      },
      {
        label: "Penyesuaian",
        to: ROUTES.INVENTORY.ADJUSTMENT,
        permission: "inventory:approve",
      },
      {
        label: "Stok Opname",
        to: ROUTES.INVENTORY.STOCK_TAKING,
        permission: "inventory:write",
      },
      {
        label: "Scan Barcode",
        to: ROUTES.BARCODE.SCANNER,
        permission: "barcode:scan",
      },
    ],
  },
  {
    label: "Supplier",
    icon: Truck,
    to: ROUTES.SUPPLIERS.LIST,
    permission: "suppliers:read",
  },
  {
    label: "Purchase Order",
    icon: ShoppingCart,
    to: ROUTES.PURCHASE_ORDERS.LIST,
    permission: "po:read",
  },
  {
    label: "Laporan",
    icon: BarChart3,
    permission: "reports:basic",
    children: [
      {
        label: "Laporan Stok",
        to: ROUTES.REPORTS.STOCK,
        permission: "reports:basic",
      },
      {
        label: "Laporan Transaksi",
        to: ROUTES.REPORTS.MOVEMENT,
        permission: "reports:basic",
      },
      {
        label: "Laporan PO",
        to: ROUTES.REPORTS.PURCHASES,
        permission: "reports:full",
      },
    ],
  },
  {
    label: "Pengguna",
    icon: Users,
    to: ROUTES.SETTINGS.USERS,
    permission: "users:read",
  },
  {
    label: "Pengaturan",
    icon: Settings,
    to: "/settings/profile",
    permission: "settings:read",
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, businessName, businessLogo } = useUiStore();
  const { can } = usePermission();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Laporan: false,
    Inventaris: false,
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev: Record<string, boolean>) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || can(item.permission),
  );

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30",
        "flex flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-56",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary-600">
          {businessLogo ? (
            <img
              src={businessLogo}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <Coffee className="w-4 h-4 text-white" />
          )}
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-bold text-gray-900 truncate">
            {businessName}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isMenuOpen = openMenus[item.label] && !sidebarCollapsed;

          if (hasChildren) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          isMenuOpen ? "rotate-180" : "",
                        )}
                      />
                    </>
                  )}
                </button>
                {isMenuOpen && (
                  <div className="pl-10 pr-2 space-y-1 py-1">
                    {item.children
                      ?.filter((c) => !c.permission || can(c.permission))
                      .map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to!}
                          className={({ isActive }) =>
                            cn(
                              "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary-50 text-primary-700"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center p-4 border-t border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title={sidebarCollapsed ? "Perluas sidebar" : "Lipat sidebar"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
