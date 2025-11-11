// src\services\push\messages\expo.message.ts

import { ExpoPushMessage } from "expo-server-sdk"

/**
 * Defines the payload structure for an Expo push notification.
 * - `to` is used for a single recipient.
 * - `recipients` can hold multiple recipient tokens.
 * - `title` and `body` are the notification content.
 * - `data` is any additional metadata you want to send.
 * - `sound`, `badge`, `channelId` are optional fields for notification customization.
 */
export interface ExpoMessagePayload {
  to?: string // single recipient
  recipients?: string[] // multiple recipients
  title: string
  body: string
  data?: Record<string, any>
  sound?: string | null
  badge?: number
  channelId?: string
}

/**
 * Class representation of an Expo push message.
 * Encapsulates validation and conversion to payloads compatible with Expo SDK.
 */
export class ExpoMessage {
  readonly to?: string
  readonly recipients?: string[]
  readonly title: string
  readonly body: string
  readonly data?: Record<string, any>
  readonly sound?: string | null
  readonly badge?: number
  readonly channelId?: string

  constructor(payload: ExpoMessagePayload) {
    this.to = payload.to
    this.recipients = payload.recipients
    this.title = payload.title
    this.body = payload.body
    this.data = payload.data
    this.sound = payload.sound ?? "default" // default to 'default' if not provided
    this.badge = payload.badge
    this.channelId = payload.channelId
  }

  /**
   * Returns a base message object used for both single and multiple payloads.
   * Excludes the `to` field, which is added later.
   */
  private baseMessage(): Omit<ExpoPushMessage, "to"> {
    return {
      title: this.title,
      body: this.body,
      data: this.data,
      sound: this.sound,
      badge: this.badge,
      channelId: this.channelId
    }
  }

  /**
   * Converts the instance into a single Expo push message payload.
   * Throws an error if `to` is not provided.
   */
  toSinglePayload(): ExpoPushMessage {
    if (!this.to) throw new Error("Recipient token is required for toSinglePayload")
    return {
      ...this.baseMessage(),
      to: this.to
    }
  }

  /**
   * Converts the instance into an array of Expo push message payloads for multiple recipients.
   * Throws an error if `recipients` array is empty or not provided.
   */
  toMultiplePayload(): ExpoPushMessage[] {
    if (!this.recipients || this.recipients.length === 0) {
      throw new Error("Recipients are required for toMultiplePayload")
    }
    return this.recipients.map((token) => ({
      ...this.baseMessage(),
      to: token
    }))
  }
}
