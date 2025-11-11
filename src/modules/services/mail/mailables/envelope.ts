import { Address } from "./address"

/**
 * Shape of data accepted by the Envelope constructor.
 * Supports strings, Address instances, or arrays of either.
 */
type EnvelopeType = {
  from?: string | Address
  to?: string | Address | Array<string | Address>
  subject?: string
  cc?: string | Address | Array<string | Address>
  bcc?: string | Address | Array<string | Address>
  replyTo?: string | Address | Array<string | Address>
  inReplyTo?: string | Address
  references?: string | string[]
}

/**
 * Represents the "envelope" of an email, including all recipients,
 * sender, subject, reply-to, and references.
 *
 * Provides a fluent/builder API for constructing email envelopes.
 *
 * Example:
 *   const envelope = new Envelope()
 *     .fromAddress("john@example.com")
 *     .toAddress(["jane@example.com", new Address("bob@example.com")])
 *     .subjectLine("Hello!")
 */
export class Envelope {
  public from?: Address
  public to: Address[] = []
  public cc?: Address[]
  public bcc?: Address[]
  public replyTo?: Address[]
  public inReplyTo?: Address
  public references?: string | string[]
  public subject?: string

  constructor(data?: EnvelopeType) {
    if (data) {
      if (data.from) this.from = this.normalizeToAddressArray(data.from)[0]
      if (data.to) this.to = this.normalizeToAddressArray(data.to)
      if (data.cc) this.cc = this.normalizeToAddressArray(data.cc)
      if (data.bcc) this.bcc = this.normalizeToAddressArray(data.bcc)
      if (data.replyTo) this.replyTo = this.normalizeToAddressArray(data.replyTo)
      if (data.inReplyTo) this.inReplyTo = this.normalizeToAddressArray(data.inReplyTo)[0]
      if (data.references) this.references = data.references
      if (data.subject) this.subject = data.subject
    }
  }

  /** Set the sender address */
  public fromAddress(from: string | Address): this {
    this.from = this.normalizeToAddressArray(from)[0]
    return this
  }

  /** Set recipient addresses */
  public toAddress(to: string | Address | Array<string | Address>): this {
    this.to = this.normalizeToAddressArray(to)
    return this
  }

  /** Set CC addresses */
  public ccAddress(cc: string | Address | Array<string | Address>): this {
    this.cc = this.normalizeToAddressArray(cc)
    return this
  }

  /** Set BCC addresses */
  public bccAddress(bcc: string | Address | Array<string | Address>): this {
    this.bcc = this.normalizeToAddressArray(bcc)
    return this
  }

  /** Set Reply-To addresses */
  public replyToAddress(replyTo: string | Address | Array<string | Address>): this {
    this.replyTo = this.normalizeToAddressArray(replyTo)
    return this
  }

  /** Set In-Reply-To address */
  public inReplyToAddress(inReplyTo: string | Address): this {
    this.inReplyTo = this.normalizeToAddressArray(inReplyTo)[0]
    return this
  }

  /** Set References header */
  public withReferences(references: string | string[]): this {
    this.references = references
    return this
  }

  /** Set email subject */
  public subjectLine(subject: string): this {
    this.subject = subject
    return this
  }

  /**
   * Utility to normalize various forms (string, Address, array) into Address[]
   */
  private normalizeToAddressArray(input: string | Address | Array<string | Address>): Address[] {
    if (typeof input === "string") return [new Address(input)]
    if (input instanceof Address) return [input]
    if (Array.isArray(input)) {
      return input.map((i) => (typeof i === "string" ? new Address(i) : i))
    }
    return []
  }
}
