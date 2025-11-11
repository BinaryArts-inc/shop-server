/**
 * Notification channels
 *
 * mail: Send email notification
 * sms: Send sms notification
 * push: Send push notification
 * broadcast: Send broadcast notification to clients
 * database: Save notification to database
 */
export type NotificationChannel = "mail" | "sms" | "push" | "broadcast" | "database"

export interface INotificationPayload {
  type: string
  data: NotificationData
  timestamp: string
}

export interface INotifiable {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export interface NotificationData<T = any> {
  title: string
  body: string
  metadata?: T
}
