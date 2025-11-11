import { Inject, Injectable, Optional } from "@nestjs/common"
import { PUSH_CONFIG_OPTIONS } from "./entities/config"
import { FirebaseService } from "../firebase/firebase.service"

import { PushMessage } from "./interfaces/message.interface"
import { PushModuleOptions } from "./interfaces/config.interface"

import { FcmMessage } from "./messages/fcm.message"
import { ExpoMessage } from "./messages/expo.message"

/**
 * Service responsible for sending push notifications via multiple strategies.
 * Supports FCM (Firebase Cloud Messaging) and Expo (future implementation).
 */
@Injectable()
export class PushService {
  constructor(
    @Inject(PUSH_CONFIG_OPTIONS)
    protected options: PushModuleOptions, // Module-level configuration options
    @Optional() private readonly firebaseService?: FirebaseService // Optional dependency, required for FCM
  ) {}

  /**
   * Main entry point for sending a push message.
   * Detects the message type and delegates to the correct strategy.
   */
  async send(message: PushMessage) {
    if (message instanceof FcmMessage) {
      await this.sendFcmMessage(message)
    } else if (message instanceof ExpoMessage) {
      await this.sendExpoMessage(message)
    } else {
      throw new Error("Unsupported push message type")
    }
  }

  /**
   * Placeholder for queuing push notifications asynchronously.
   * Currently not implemented.
   */
  async queue(data: PushMessage) {
    throw new Error("PUSH QUEUE NOT YET IMPLEMENTED" + data.body)
  }

  /**
   * Handles sending FCM messages via FirebaseService.
   * Supports single token, multiple tokens, topic, and condition-based payloads.
   */
  private async sendFcmMessage(message: FcmMessage) {
    if (!this.firebaseService) throw new Error("FirebaseService not initialized")

    if (message.token) {
      await this.firebaseService.sendMessage(message.toTokenPayload(this.options.fcm))
    }

    if (message.tokens) {
      await this.firebaseService.sendMulticast(message.toTokensPayload(this.options.fcm))
    }

    if (message.topic) {
      await this.firebaseService.sendMessage(message.toTopicPayload(this.options.fcm))
    }

    if (message.condition) {
      await this.firebaseService.sendMessage(message.toConditionPayload(this.options.fcm))
    }
  }

  /**
   * Handles sending Expo push messages.
   * Currently a placeholder — actual Expo implementation should integrate with expo-server-sdk.
   */
  private async sendExpoMessage(message: PushMessage) {
    throw new Error("EXPO STRATEGY NOT IMPLEMENTED" + message.body)
  }
}
