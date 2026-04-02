import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuthStore, useNotificationStore } from "@/store";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-20 flex items-center justify-end px-4 gap-2">
      {/* Notification bell */}
      <button
        onClick={() => navigate(ROUTES.NOTIFICATIONS)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <UserAvatar user={user} size="sm" />
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user.name}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              dropdownOpen && "rotate-180",
            )}
          />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <UserAvatar user={user} size="sm" showLabel />
              </div>
              <button
                onClick={() => {
                  navigate(ROUTES.PROFILE);
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="w-4 h-4" /> Profil Saya
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
