import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ToastContainer } from "../feedback/Toast";
import { useUiStore } from "@/store";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-56",
        )}
      >
        <div className="page-container">{children}</div>
      </main>
      <ToastContainer />
    </div>
  );
}
