import { Address, Mailable } from "@modules/services/mail"
import { NotificationData } from "./notification.interface"
import { PushMessage as PMessage } from "@modules/services/push/interfaces/message.interface"
import { Header } from "@modules/services/mail/interface/messages.interface"
import { Attachment } from "@modules/services/mail/mailables/attachment"
import { Content } from "@modules/services/mail/mailables/content"
import { Envelope } from "@modules/services/mail/mailables/envelope"

export type BroadcastMessage = {
  topic?: string
  data: NotificationData
}

export type SmsMessage = {
  title: string
  body: string
}

export type DatabaseMessage = NotificationData

export type PushMessage = PMessage

type MailMessageType = {
  to: Address | string
  from?: Address | string
  subject: string
  message: string
  client?: string
}
export class MailMessage extends Mailable {
  private readonly to: Address | string
  private readonly from: Address | string
  private readonly message: string
  private readonly subject: string
  public client: string

  constructor(data: MailMessageType) {
    super()
    this.to = data.to
    this.subject = data.subject
    this.message = data.message
    this.from = data.from
    this.client = data.client
  }

  public envelope(): Envelope {
    return new Envelope({
      to: this.to,
      from: this.from,
      subject: this.subject
    })
  }

  public content(): Content {
    return new Content({
      text: this.message
    })
  }

  public attachments(): Attachment[] {
    return []
  }
  public headers(): Header[] {
    return []
  }

  public withClient(client: string) {
    this.client = client
    return this
  }
}
