import {
  PackageOpen,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { PageWrapper, StatsCard } from "@/components";
import { formatCompactCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { useState, useEffect } from "react";
import {
  MovementTrendChart,
  SupplierExpenseChart,
  CategoryPieChart,
  RecentActivityFeed,
} from "../components";
import {
  reportsService,
  DashboardKPI,
} from "@/features/reports/reports.service";

export function DashboardPage() {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);

  useEffect(() => {
    reportsService
      .getDashboard()
      .then(setKpi)
      .catch(() => null);
  }, []);

  return (
    <PageWrapper
      title="Dashboard"
      description="Ringkasan inventaris Caffe Dalley hari ini"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.INVENTORY.STOCK_IN)}
            className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            Stok Masuk
          </button>
          <button
            onClick={() => navigate(ROUTES.INVENTORY.STOCK_OUT)}
            className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowUpFromLine className="w-4 h-4 text-amber-600" />
            Stok Keluar
          </button>
        </div>
      }
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title="Total Produk"
          value={kpi?.total_products ?? "—"}
          icon={Package}
          iconColor="text-primary-600"
          iconBg="bg-primary-50"
        />
        <StatsCard
          title="Nilai Inventaris"
          value={kpi ? formatCompactCurrency(kpi.total_stock_value) : "—"}
          icon={TrendingUp}
          iconColor="text-success"
          iconBg="bg-emerald-50"
        />

        <StatsCard
          title="Masuk Hari Ini"
          value={kpi?.today_in ?? "—"}
          icon={ArrowDownToLine}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatsCard
          title="Keluar Hari Ini"
          value={kpi?.today_out ?? "—"}
          icon={ArrowUpFromLine}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatsCard
          title="Alert Stok"
          value={
            (kpi?.low_stock_count ?? 0) +
            (kpi?.critical_count ?? 0) +
            (kpi?.out_of_stock_count ?? 0)
          }
          icon={AlertTriangle}
          iconColor="text-danger"
          iconBg="bg-red-50"
        />
      </div>

      {/* Top Charts Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <MovementTrendChart />
        <SupplierExpenseChart />
      </div>

      {/* Bottom Section: Categories, Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <CategoryPieChart />
        </div>

        <div className="lg:col-span-4">
          <RecentActivityFeed />
        </div>

        {/* Stock Alerts */}
        <div className="lg:col-span-4">
          <div className="card flex flex-col h-full min-h-[400px]">
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-900">
                ⚠️ Alert Stok Minimum
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Produk yang perlu diisi ulang
              </p>
            </div>
            <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
              {kpi &&
              kpi.critical_count +
                kpi.low_stock_count +
                kpi.out_of_stock_count ===
                0 ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                  <PackageOpen className="w-4 h-4" />
                  Semua stok aman
                </div>
              ) : (
                <div className="px-5 py-4 text-sm">
                  {kpi && kpi.out_of_stock_count > 0 && (
                    <p className="text-danger font-semibold mb-1">
                      • {kpi.out_of_stock_count} produk habis stok
                    </p>
                  )}
                  {kpi && kpi.critical_count > 0 && (
                    <p className="text-danger font-medium mb-1">
                      • {kpi.critical_count} produk stok kritis
                    </p>
                  )}
                  {kpi && kpi.low_stock_count > 0 && (
                    <p className="text-warning font-medium">
                      • {kpi.low_stock_count} produk stok rendah
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    Kunjungi halaman{" "}
                    <button
                      className="underline text-primary-500"
                      onClick={() => navigate(ROUTES.REPORTS.STOCK)}
                    >
                      Laporan Stok
                    </button>{" "}
                    untuk detail lengkap.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
