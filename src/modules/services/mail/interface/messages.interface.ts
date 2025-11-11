import { Readable } from "stream"
import { ParsedUrlQuery } from "querystring"
import { MailAddress } from "./service.interface"

/**
 * Internal representation of a parsed URL.
 * Used mainly for attachments (when path is provided as a URL).
 */
interface Url {
  auth: string | null
  hash: string | null
  host: string | null
  hostname: string | null
  href: string
  path: string | null
  pathname: string | null
  protocol: string | null
  search: string | null
  slashes: boolean | null
  port: string | null
  query: string | null | ParsedUrlQuery
}

/**
 * Message payload for SMTP-based mailers.
 * Closely matches Nodemailer’s message structure.
 */
export type SmtpMessage = {
  from?: string | MailAddress
  to?: Array<string | MailAddress>
  cc?: Array<string | MailAddress>
  bcc?: Array<string | MailAddress>
  replyTo?: Array<string | MailAddress>
  inReplyTo?: string | MailAddress
  subject?: string
  text?: string
  html?: string
  priority?: "high" | "normal" | "low"
  attachments?: Array<{
    content?: string | Buffer | Readable
    path?: string | Url
    filename?: string | false
    cid?: string
    encoding?: string
    contentType?: string
    contentTransferEncoding?: "7bit" | "base64" | "quoted-printable" | false
    contentDisposition?: "attachment" | "inline"
    headers?: Record<string, string>
    raw?: string | Buffer | Readable | { content?: string | Buffer | Readable; path?: string | Url }
  }>
  headers?: Array<{ key: string; value: string }>
  date?: Date | string
  attachDataUrls?: boolean
}

/**
 * Message payload for AWS SES.
 * Mirrors SES v2 sendEmail API structure.
 */
export type SesMessage = {
  FromEmailAddress: string
  ReplyToAddresses?: string[]
  Destination: {
    ToAddresses: string[]
    CcAddresses?: string[]
    BccAddresses?: string[]
  }
  Content: {
    Simple: {
      Subject: { Data: string }
      Body: {
        Text?: { Data: string }
        Html?: { Data: string }
      }
      Attachments?: Array<{
        RawContent: Buffer
        FileName: string
        ContentDisposition?: "ATTACHMENT" | "INLINE"
        ContentDescription?: string
        ContentId?: string
        ContentTransferEncoding?: "BASE64" | "QUOTED_PRINTABLE" | "SEVEN_BIT"
        ContentType?: string
      }>
    }
  }
  EmailTags?: Array<{ Name: string; Value: string }>
}

/**
 * Simplified Mailgun message payload.
 * Matches fields expected by Mailgun HTTP API.
 */
export type MailGunMessage = {
  message?: string
  text?: string
  html?: string
  from?: string
  to?: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
  inline?: any
  attachment?: Array<{
    data: string | Buffer | Readable
    filename?: string
    contentType?: string
    knownLength?: number
    [key: string]: unknown
  }>
}

/**
 * Generic mail header type.
 */
export type Header = { key: string; value: string }
