import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/feedback/Toast";

interface ExportButtonProps {
  reportName: string;
  /** Optional callback — if provided, called instead of the mock toast */
  onExport?: () => void;
}

export function ExportButton({ reportName, onExport }: ExportButtonProps) {
  const toast = useToast();

  const handleExport = () => {
    if (onExport) {
      onExport();
      const date = new Date().toISOString().split("T")[0];
      toast.success(
        "Export berhasil",
        `File ${reportName}_${date}.csv telah diunduh.`,
      );
    } else {
      toast.info("Export", "Tidak ada data untuk diekspor.");
    }
  };

  const handlePrint = () => {
    toast.info("Menyiapkan PDF...", "Halaman akan dibuka di mode cetak.");
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="w-4 h-4 mr-2" />
        Cetak PDF
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
}
