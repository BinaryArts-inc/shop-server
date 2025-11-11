import { ExpoMessage } from "../messages/expo.message"
import { FcmMessage } from "../messages/fcm.message"

/**
 * Push notification messages.
 * - Can be either a Firebase Cloud Messaging (FCM) message
 * - Or an Expo push notification message
 *
 * This allows the push service to accept a single type while supporting
 * multiple providers under the hood.
 */
export type PushMessage = FcmMessage | ExpoMessage
