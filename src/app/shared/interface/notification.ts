export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationInterface {
  id?: string;
  title?: string;
  closable?: boolean;
  message: string;
  type: NotificationType;
  duration?: number; // milliseconds, optional
}
