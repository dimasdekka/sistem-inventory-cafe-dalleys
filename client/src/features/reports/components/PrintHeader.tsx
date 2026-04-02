/**
 * PrintHeader — hanya terlihat saat cetak (hidden di browser).
 * Menampilkan kop surat profesional: nama perusahaan (kiri) + judul laporan (kanan).
 * Prinsip: SRP — komponen ini satu-satunya bertanggung jawab atas tampilan header cetak.
 */

interface PrintHeaderProps {
  title: string;
  subtitle?: string;
  /** Label filter aktif saat ini, mis: "Periode: Bulan Ini | Tipe: Barang Masuk" */
  activeFilters?: string;
  /** Nama perusahaan, default ke "Dalley Inventory" */
  companyName?: string;
  /** Sub-info perusahaan (alamat, telp, dll) */
  companyInfo?: string;
}

export function PrintHeader({
  title,
  subtitle,
  activeFilters,
  companyName = "Dalley Inventory",
  companyInfo = "Sistem Manajemen Inventaris",
}: PrintHeaderProps) {
  const now = new Date();
  const printDate = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const printTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Generate a simple report number based on timestamp
  const reportNumber = `RPT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    // hidden on screen, visible on print (via .print-header CSS in globals.css)
    <div className="print-header hidden">
      {/* Two-column layout: company info (left) + report info (right) */}
      <div className="print-header__body">
        {/* Left: Company Branding */}
        <div className="print-header__company">
          {/* Logo Box */}
          <div className="print-header__logo-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" fill="none" stroke="white" strokeWidth="1.5" />
              <line x1="12" y1="12" x2="12" y2="16" stroke="#4f46e5" strokeWidth="2" />
              <line x1="10" y1="14" x2="14" y2="14" stroke="#4f46e5" strokeWidth="2" />
            </svg>
          </div>
          {/* Company Text */}
          <div>
            <p className="print-header__company-name">{companyName}</p>
            <p className="print-header__company-sub">{companyInfo}</p>
          </div>
        </div>

        {/* Right: Report Info */}
        <div className="print-header__report-info">
          <p className="print-header__report-title">{title}</p>
          {subtitle && (
            <p className="print-header__report-meta">{subtitle}</p>
          )}
          {activeFilters && (
            <p className="print-header__report-meta">
              <strong>Filter:</strong> {activeFilters}
            </p>
          )}
          <p className="print-header__report-meta">
            <strong>No. Laporan:</strong> {reportNumber}
          </p>
          <p className="print-header__report-meta">
            <strong>Dicetak:</strong> {printDate}, pukul {printTime}
          </p>
        </div>
      </div>

      {/* Divider line with accent */}
      <hr className="print-header__divider" />
    </div>
  );
}
