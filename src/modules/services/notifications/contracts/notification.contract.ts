import { NotificationChannel, INotifiable } from "../interfaces/notification.interface"
import { BroadcastMessage, DatabaseMessage, SmsMessage, PushMessage, MailMessage } from "../interfaces/messages.interface"

export abstract class NotificationContract {
  private queue = false
  abstract type: string

  constructor(public readonly notifiable: INotifiable) {}

  /**
   * Which channels this notification should be sent on.
   */
  abstract via(): NotificationChannel[]

  /**
   * Convert to email payload if email is enabled.
   */
  toBroadCast?(): BroadcastMessage

  /**
   * Convert to email payload if email is enabled.
   */
  toMail?(): MailMessage

  /**
   * Convert to push payload if push is enabled.
   */
  toPush?(): PushMessage

  /**
   * Convert to database payload if db is enabled.
   */
  toDatabase?(): DatabaseMessage

  /**
   * Convert to sms payload if sms is enabled.
   */
  toSms?(): SmsMessage

  /**
   * Indicate if this notification should be queued.
   */
  shouldQueue(): this {
    this.queue = true
    return this
  }

  /**
   * Check if notification should be queued.
   */
  isQueued(): boolean {
    return this.queue
  }
}
