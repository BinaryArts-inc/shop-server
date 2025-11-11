import { FcmMessage } from "@modules/services/push/messages/fcm.message"
import { BroadcastMessage, DatabaseMessage, MailMessage, PushMessage, SmsMessage } from "../interfaces/messages.interface"
import { INotifiable, NotificationChannel } from "../interfaces/notification.interface"
import { NotificationContract } from "./notification.contract"

type Notifiable = INotifiable & {
  token: string
}

export class TestNotification extends NotificationContract {
  public type = "test.notification"
  public title = "Test Notification"
  public body = "testing testing testing"
  private readonly token: string

  constructor(notifiable: Notifiable) {
    const { token, ...no } = notifiable
    super(no)
    this.token = token
  }

  viaTransporter(): string {
    return ""
  }

  via(): NotificationChannel[] {
    return ["broadcast", "database", "mail", "push", "sms"]
  }

  toBroadCast(): BroadcastMessage {
    return {
      topic: "maybe.user.id",
      data: {
        title: this.title,
        body: this.body,
        metadata: {
          userId: this.notifiable.id,
          email: this.notifiable.email
        }
      }
    }
  }

  toDatabase(): DatabaseMessage {
    return {
      title: this.title,
      body: this.body,
      metadata: {
        userId: this.notifiable.id,
        email: this.notifiable.email
      }
    }
  }

  toMail(): MailMessage {
    return new MailMessage({
      to: this.notifiable.email,
      subject: this.title,
      message: this.body
    })
  }

  toPush(): PushMessage {
    return new FcmMessage({
      title: this.title,
      body: this.body,
      token: this.token
    })
  }

  toSms(): SmsMessage {
    return {
      title: this.title,
      body: this.body
    }
  }
}
