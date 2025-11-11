import {
  AndroidConfig,
  ApnsConfig,
  BaseMessage,
  ConditionMessage,
  MulticastMessage,
  Notification,
  TokenMessage,
  TopicMessage,
  WebpushConfig
} from "firebase-admin/lib/messaging/messaging-api"
import { FcmOptions } from "../interfaces/config.interface"

/**
 * Defines the payload structure for an FCM (Firebase Cloud Messaging) push notification.
 * - Supports single token, multiple tokens, topic, or condition-based messages.
 * - Includes notification content (`title`, `body`), optional `data`, and platform-specific configs.
 */
export interface FCMMessagePayload {
  title: string
  body: string
  token?: string // single device token
  tokens?: string[] // multiple device tokens
  topic?: string // topic name
  condition?: string // condition expression for FCM
  data?: Record<string, string>
  imageUrl?: string
  priority?: "normal" | "high"
  android?: any
  apns?: any
  webpush?: any
}

/**
 * Class representation of an FCM message.
 * Handles validation and conversion into payloads compatible with Firebase Admin SDK.
 */
export class FcmMessage {
  readonly token?: string
  readonly tokens?: string[]
  readonly topic?: string
  readonly condition?: string
  readonly title: string
  readonly body: string
  readonly data?: Record<string, string>
  readonly imageUrl?: string
  readonly priority: "normal" | "high"
  readonly android?: AndroidConfig
  readonly apns?: ApnsConfig
  readonly webpush?: WebpushConfig

  constructor(payload: FCMMessagePayload) {
    this.token = payload.token
    this.tokens = payload.tokens
    this.topic = payload.topic
    this.condition = payload.condition
    this.title = payload.title
    this.body = payload.body
    this.data = payload.data
    this.imageUrl = payload.imageUrl
    this.priority = payload.priority ?? "high" // default priority is 'high'
    this.android = payload.android
    this.apns = payload.apns
    this.webpush = payload.webpush
  }

  /**
   * Builds the base notification object shared across different FCM message types.
   * Applies defaults from module configuration when specific fields are not set.
   */
  private baseNotification(defaults?: FcmOptions): BaseMessage {
    const notification: Notification = {
      title: this.title,
      body: this.body,
      imageUrl: defaults?.image // fallback to default image if not provided
    }

    if (this.imageUrl) {
      notification.imageUrl = this.imageUrl
    }

    return {
      notification,
      android: this.android ?? defaults?.android ?? { priority: this.priority },
      apns: this.apns ?? defaults?.apns ?? { headers: { "apns-priority": this.priority === "high" ? "10" : "5" } },
      webpush: this.webpush ?? defaults?.webPush,
      data: this.data
    }
  }

  /**
   * Converts to a single-token FCM payload.
   * Throws an error if `token` is not provided.
   */
  toTokenPayload(defaults?: FcmOptions): TokenMessage {
    if (!this.token) throw new Error("Token is required for toTokenPayload")
    return {
      ...this.baseNotification(defaults),
      token: this.token
    }
  }

  /**
   * Converts to a multi-token FCM payload.
   * Throws an error if `tokens` array is empty or not provided.
   */
  toTokensPayload(defaults?: FcmOptions): MulticastMessage {
    if (!this.tokens || this.tokens.length === 0) throw new Error("Tokens are required for toTokensPayload")
    return {
      ...this.baseNotification(defaults),
      tokens: this.tokens
    }
  }

  /**
   * Converts to a topic-based FCM payload.
   * Throws an error if `topic` is not provided.
   */
  toTopicPayload(defaults?: FcmOptions): TopicMessage {
    if (!this.topic) throw new Error("Topic is required for toTopicPayload")
    return {
      ...this.baseNotification(defaults),
      topic: this.topic
    }
  }

  /**
   * Converts to a condition-based FCM payload.
   * Throws an error if `condition` is not provided.
   */
  toConditionPayload(defaults?: FcmOptions): ConditionMessage {
    if (!this.condition) throw new Error("Condition is required for toConditionPayload")
    return {
      ...this.baseNotification(defaults),
      condition: this.condition
    }
  }
}
