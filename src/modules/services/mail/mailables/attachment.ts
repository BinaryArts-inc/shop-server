import { Readable } from "stream"
import { Url } from "url"

/**
 * Minimal shape of an attachment (content or path).
 */
export type AttachmentLike = {
  /** String, Buffer, or Stream contents for the attachment */
  content?: string | Buffer | Readable
  /** Path to a file or URL (data URIs are allowed) */
  path?: string | Url
}

/**
 * Full attachment configuration options.
 * Extends AttachmentLike with additional metadata fields.
 */
export type AttachmentOptions = AttachmentLike & {
  filename?: string
  cid?: string
  encoding?: string
  contentType?: string
  contentTransferEncoding?: "7bit" | "base64" | "quoted-printable"
  contentDisposition?: "attachment" | "inline"
  headers?: Record<string, string>
  raw?: string | Buffer | Readable | AttachmentLike
}

/**
 * Builder/utility class for constructing mail attachments.
 *
 * Provides a fluent API (`withContent()`, `withPath()`, etc.)
 * and converts itself into a Nodemailer-compatible object via `toObject()`.
 *
 * Example:
 *   const attachment = new Attachment()
 *     .withContent(fs.readFileSync("report.pdf"))
 *     .withFilename("report.pdf")
 *     .withContentType("application/pdf")
 *
 *   mailer.sendMail({ attachments: [attachment.toObject()] })
 */
export class Attachment {
  public content?: string | Buffer | Readable
  public path?: string | Url
  public filename?: string
  public cid?: string
  public encoding?: string
  public contentType?: string
  public contentTransferEncoding?: "7bit" | "base64" | "quoted-printable"
  public contentDisposition?: "attachment" | "inline"
  public headers?: Record<string, string>
  public raw?: string | Buffer | Readable | AttachmentLike

  constructor(data?: AttachmentOptions) {
    if (data) {
      Object.assign(this, data)
    }
  }

  /** Set content (Buffer, string, or stream). */
  public withContent(content: string | Buffer | Readable): this {
    this.content = content
    return this
  }

  /** Set path (file path or URL). */
  public withPath(path: string | Url): this {
    this.path = path
    return this
  }

  /** Set filename. */
  public withFilename(name: string): this {
    this.filename = name
    return this
  }

  /** Set Content-ID (for inline images). */
  public withCid(cid: string): this {
    this.cid = cid
    return this
  }

  /** Set encoding. */
  public withEncoding(enc: string): this {
    this.encoding = enc
    return this
  }

  /** Set MIME content type. */
  public withContentType(type: string): this {
    this.contentType = type
    return this
  }

  /** Set transfer encoding. */
  public withTransferEncoding(enc: "7bit" | "base64" | "quoted-printable"): this {
    this.contentTransferEncoding = enc
    return this
  }

  /** Set content disposition (attachment or inline). */
  public withDisposition(type: "attachment" | "inline"): this {
    this.contentDisposition = type
    return this
  }

  /** Set custom headers. */
  public withHeaders(headers: Record<string, string>): this {
    this.headers = headers
    return this
  }

  /** Set raw override. */
  public withRaw(raw: string | Buffer | Readable | AttachmentLike): this {
    this.raw = raw
    return this
  }

  /**
   * Convert into a Nodemailer-compatible attachment object.
   */
  public toObject(): AttachmentOptions {
    return {
      content: this.content,
      path: this.path,
      filename: this.filename,
      cid: this.cid,
      encoding: this.encoding,
      contentType: this.contentType,
      contentTransferEncoding: this.contentTransferEncoding,
      contentDisposition: this.contentDisposition ?? "attachment",
      headers: this.headers,
      raw: this.raw
    }
  }

  /**
   * Convert content into a Buffer.
   * - If content is a string, returns a UTF-8 buffer.
   * - If content is already a buffer, returns it directly.
   *
   * ⚠️ Will return `undefined` if content is a stream or missing.
   */
  public toBuffer(): Buffer | undefined {
    if (typeof this.content === "string") {
      return Buffer.from(this.content, "utf-8")
    }

    if (Buffer.isBuffer(this.content)) {
      return this.content
    }
  }
}
