import { create } from "zustand";

export type NotificationType = "critical" | "warning" | "info" | "expired";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  isRead: boolean;
  createdAt: string;
  dismissedAt?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isPolling: boolean;
  setNotifications: (notifs: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  setPolling: (polling: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isPolling: false,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(
      (n) => !n.isRead && !n.dismissedAt,
    ).length;
    set({ notifications, unreadCount });
  },

  addNotification: (notif) => {
    set((state) => {
      const notifications = [notif, ...state.notifications];
      const unreadCount = !notif.isRead
        ? state.unreadCount + 1
        : state.unreadCount;
      return { notifications, unreadCount };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      const unreadCount = notifications.filter(
        (n) => !n.isRead && !n.dismissedAt,
      ).length;
      return { notifications, unreadCount };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  dismiss: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, dismissedAt: new Date().toISOString() } : n,
      );
      const unreadCount = notifications.filter(
        (n) => !n.isRead && !n.dismissedAt,
      ).length;
      return { notifications, unreadCount };
    });
  },

  setPolling: (polling) => set({ isPolling: polling }),
}));

// Selector: active (non-dismissed) notifications
export const selectActiveNotifications = (
  state: ReturnType<typeof useNotificationStore.getState>,
) => state.notifications.filter((n) => !n.dismissedAt);
