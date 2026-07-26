import { KabisNotification, KabisStats } from "@/types";
import { api } from "./api";

export const kabisService = {
  getKabisNotifications: () => api.get<KabisNotification[]>('/kabis').then(res => res.data),
  getKabisNotificationById: (id: string) => api.get<KabisNotification>(`/kabis/${id}`).then(res => res.data),
  getKabisStats: () => api.get<KabisStats>('/kabis/stats').then(res => res.data),
  sendKabisNotification: (data: any) => api.post('/kabis/send', data).then(res => res.data),
  sendAllKabisNotifications: (ids: string[]) => api.post('/kabis/send-all', { ids }).then(res => res.data),
  retryKabisNotification: (id: string) => api.post(`/kabis/retry/${id}`).then(res => res.data),
};
