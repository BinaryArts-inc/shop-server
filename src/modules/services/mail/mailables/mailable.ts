import { Address } from "./address"
import { Content } from "./content"
import { Envelope } from "./envelope"
import { Attachment } from "./attachment"
import { MailAddress } from "../interface/service.interface"
import { Header, MailGunMessage, SesMessage, SmtpMessage } from "../interface/messages.interface"

/**
 * Abstract base class for all emails (Mailables).
 *
 * A Mailable encapsulates:
 * - Envelope (from, to, cc, bcc, reply-to, subject, references)
 * - Content (HTML and/or text body)
 * - Attachments
 * - Headers
 *
 * Subclasses must implement:
 *   - envelope(): Envelope
 *   - content(): Content
 *   - attachments(): Attachment[]
 *   - headers(): Header[]
 *
 * Provides utility methods to generate provider-specific messages (SMTP, SES, Mailgun).
 */
export abstract class Mailable {
  public priority: "high" | "normal" | "low" | undefined
  public date?: Date | string
  public attachDataUrls?: boolean

  /** Return the Envelope for this mail */
  public abstract envelope(): Envelope

  /** Return the Content for this mail */
  public abstract content(): Content

  /** Return attachments for this mail */
  public abstract attachments(): Attachment[]

  /** Return headers for this mail */
  public abstract headers(): Header[]

  /**
   * Builds a normalized object containing envelope and compiled message.
   * Used internally for generating provider-specific messages.
   */
  private buildData() {
    const envelope = this.envelope()
    const content = this.content()
    const message = content.build()

    return { envelope, message }
  }

  /**
   * Generate a Nodemailer/Simple SMTP-compatible message object.
   */

  public getSmtpMessage(from: MailAddress): SmtpMessage {
    const { envelope, message } = this.buildData()
    const f = envelope.from ?? new Address(from.address, from.name)

    return {
      subject: envelope.subject,
      from: f.toObject(),
      to: envelope.to.map((t) => t.toObject()),
      cc: envelope.cc?.map((c) => c.toObject()),
      bcc: envelope.bcc?.map((c) => c.toObject()),
      replyTo: envelope.replyTo?.map((c) => c.toObject()),
      inReplyTo: envelope.inReplyTo?.toObject(),
      text: message.text,
      html: message.html,
      priority: this.priority,
      attachments: this.attachments().map((a) => a.toObject()),
      headers: this.headers ? this.headers() : undefined,
      date: this.date,
      attachDataUrls: this.attachDataUrls
    }
  }

  /**
   * Generate an AWS SES-compatible message object.
   */
  public getSesMessage(from: MailAddress): SesMessage {
    const { envelope, message } = this.buildData()
    const f = envelope.from ?? new Address(from.address, from.name)

    return {
      FromEmailAddress: f.format(),
      ReplyToAddresses: envelope.replyTo?.map((c) => c.format()),
      Destination: {
        ToAddresses: envelope.to.map((t) => t.format()),
        CcAddresses: envelope.cc?.map((c) => c.format()),
        BccAddresses: envelope.bcc?.map((c) => c.format())
      },
      Content: {
        Simple: {
          Subject: {
            Data: envelope.subject
          },
          Body: {
            Text: {
              Data: message.text
            },
            Html: {
              Data: message.html
            }
          },
          Attachments: this.attachments()?.map((a) => ({
            RawContent: a.toBuffer(),
            FileName: a.filename,
            ContentDisposition: a.contentDisposition === "attachment" ? "ATTACHMENT" : "INLINE",
            ContentDescription: "",
            ContentId: a.cid,
            ContentTransferEncoding:
              a.contentTransferEncoding === "base64" ? "BASE64" : a.contentTransferEncoding === "quoted-printable" ? "QUOTED_PRINTABLE" : "SEVEN_BIT",
            ContentType: a.contentType
          }))
        }
      },
      EmailTags: this.headers
        ? this.headers().map((t) => ({
            Name: t.key,
            Value: t.value
          }))
        : undefined
    }
  }

  /**
   * Generate a Mailgun-compatible message object.
   */
  public getMailGunMessage(from: MailAddress): MailGunMessage {
    const { envelope, message } = this.buildData()
    const f = envelope.from ?? new Address(from.address, from.name)

    return {
      text: message.text,
      html: message.html,
      from: f.format(),
      to: envelope.to.map((t) => t.format()),
      cc: envelope.cc?.map((c) => c.format()),
      bcc: envelope.bcc?.map((c) => c.format()),
      subject: envelope.subject,
      attachment: this.attachments().map((a) => ({
        data: a.path && typeof a.path === "string" ? a.path : a.toBuffer(),
        filename: a.filename,
        contentType: a.contentType
      }))
    }
  }
}
