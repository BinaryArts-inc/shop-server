import { MailAddress } from "../interface/service.interface"

/**
 * Represents an email address with an optional display name.
 *
 * Example usage:
 *   new Address("jane@example.com", "Jane Doe")
 *     .format()   // "Jane Doe <jane@example.com>"
 *     .toObject() // { name: "Jane Doe", address: "jane@example.com" }
 */
export class Address {
  public address: string
  public name?: string | undefined

  constructor(address: string, name?: string) {
    this.address = address
    this.name = name
  }

  /**
   * Convert to the plain MailAddress interface
   * for use with service-level contracts.
   */
  toObject(): MailAddress {
    return {
      name: this.name,
      address: this.address
    }
  }

  /**
   * Format into a standard RFC 5322 string.
   * - Without name: "user@example.com"
   * - With name:    "John Doe <user@example.com>"
   */
  format() {
    if (!this.name) return this.address
    return `${this.name} <${this.address}>`
  }
}
