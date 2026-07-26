import { api, extractData } from "./api";
import { Notification } from "@/types/notification";

export const notificationService = {
  getNotifications: (): Promise<Notification[]> => api.get('/notifications').then(extractData),
  getUnreadNotifications: (): Promise<Notification[]> => api.get('/notifications/unread').then(extractData),
  getUnreadCount: (): Promise<number> => api.get('/notifications/count').then(extractData),
  markAsRead: (id: string): Promise<Notification> => api.patch(`/notifications/${id}/read`).then(extractData),
  markAllAsRead: (): Promise<void> => api.patch('/notifications/read-all').then(extractData),
  deleteNotification: (id: string): Promise<void> => api.delete(`/notifications/${id}`).then(extractData),
};
