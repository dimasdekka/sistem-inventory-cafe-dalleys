import { apiClient } from "@/lib/api-client";

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  is_read: boolean;
  created_at: string;
}

export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    const res = await apiClient.get("/notifications");
    return res.data.data ?? [];
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get("/notifications/count");
    return res.data.data?.count ?? 0;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all");
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};

export default notificationsService;
