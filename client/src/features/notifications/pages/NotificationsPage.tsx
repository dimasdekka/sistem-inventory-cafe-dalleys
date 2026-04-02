import { useState, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils";
import notificationsService, { Notification } from "../notifications.service";
import { useToast } from "@/components/feedback/Toast";

export function NotificationsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsService.getAll();
      setNotifications(data);
    } catch {
      toast.error("Gagal memuat notifikasi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch {
      toast.error("Gagal menandai notifikasi");
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("Semua notifikasi telah ditandai terbaca");
    } catch {
      toast.error("Gagal menandai semua notifikasi");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getTypeDotClass = (type: Notification["type"]) => {
    switch (type) {
      case "error":
        return "bg-danger";
      case "warning":
        return "bg-warning";
      case "success":
        return "bg-success";
      default:
        return "bg-info";
    }
  };

  return (
    <PageWrapper
      title="Notifikasi"
      description="Semua alert stok dan notifikasi sistem"
      actions={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllAsRead}
            isLoading={isMarkingAll}
            disabled={notifications.every((n) => n.is_read)}
          >
            Tandai Semua Terbaca
          </Button>
        </div>
      }
    >
      <div className="card divide-y divide-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title="Tidak ada notifikasi"
            description="Semua stok dalam kondisi normal"
          />
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${!notif.is_read ? "bg-blue-50/30" : ""}`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getTypeDotClass(notif.type)}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <Badge variant="primary" size="sm">
                      Baru
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(notif.created_at)}
                </p>
              </div>
              {!notif.is_read && (
                <button
                  className="flex-shrink-0 p-1 text-gray-300 hover:text-success transition-colors"
                  title="Tandai terbaca"
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </PageWrapper>
  );
}
