import { MailMessage } from "../interfaces/messages.interface"
import { NotificationChannel } from "../interfaces/notification.interface"
import { NotificationContract } from "./notification.contract"

export class TestMailNotification extends NotificationContract {
  public type = "test.notification"
  public subject = "Testing Testing"
  public message = "this is a test"

  via(): NotificationChannel[] {
    return ["mail"]
  }

  toMail(): MailMessage {
    throw new Error()
  }
}
