import { Search } from "lucide-react";

interface ReportFiltersProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  periodFilter?: string;
  onPeriodChange?: (val: string) => void;
  typeFilter?: string;
  onTypeChange?: (val: string) => void;
  hidePeriodAndType?: boolean;
  hideTypeOnly?: boolean;
}

export function ReportFilters({
  searchTerm,
  onSearchChange,
  periodFilter,
  onPeriodChange,
  typeFilter,
  onTypeChange,
  hidePeriodAndType,
  hideTypeOnly,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari Produk, SKU, atau No Referensi..."
          value={searchTerm || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="input-base pl-9 w-full text-sm py-1.5"
        />
      </div>

      {!hidePeriodAndType && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Periode:
            </label>
            <select
              className="input-base py-1.5 text-sm"
              value={periodFilter || "all"}
              onChange={(e) => onPeriodChange?.(e.target.value)}
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="this_month">Bulan Ini</option>
            </select>
          </div>

          {!hideTypeOnly && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Tipe:</label>
              <select
                className="input-base py-1.5 text-sm"
                value={typeFilter || "all"}
                onChange={(e) => onTypeChange?.(e.target.value)}
              >
                <option value="all">Semua Tipe</option>
                <option value="in">Barang Masuk</option>
                <option value="out">Barang Keluar</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
