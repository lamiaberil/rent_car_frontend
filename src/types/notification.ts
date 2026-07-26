export type NotificationPriority = 'low' | 'medium' | 'high';

export type NotificationType =
  | 'new_reservation'
  | 'reservation_cancelled'
  | 'reservation_confirmed'
  | 'vehicle_delivery_approaching'
  | 'vehicle_return_approaching'
  | 'vehicle_maintenance_due'
  | 'kabis_failed'
  | 'new_user_created';

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string; // ISO string
  isRead: boolean;
  type: NotificationType;
  priority: NotificationPriority;
  userId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}
