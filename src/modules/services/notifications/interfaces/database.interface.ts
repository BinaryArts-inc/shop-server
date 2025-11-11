import { NotificationData } from "./notification.interface"

export interface DatabaseNotification {
  type: string
  body: string
  data: NotificationData
}
