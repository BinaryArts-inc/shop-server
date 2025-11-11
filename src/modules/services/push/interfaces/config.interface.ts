import { ModuleMetadata } from "@nestjs/common"
import { AndroidConfig, ApnsConfig, WebpushConfig } from "firebase-admin/lib/messaging/messaging-api"

/**
 * Defines the available push notification providers.
 * - 'fcm'  → Firebase Cloud Messaging
 * - 'expo' → Expo push notification service
 */
export type PushNotificationProvider = "fcm" | "expo"

// Future placeholder for Expo configuration options if needed
// export interface ExpoOptions {
//   // token?: string
// }

/**
 * Firebase Cloud Messaging configuration options.
 * These are optional overrides for customizing push notification delivery
 * across different platforms.
 */
export interface FcmOptions {
  image?: string // Default image for notifications
  android?: AndroidConfig // Android-specific notification options
  apns?: ApnsConfig // Apple Push Notification Service options (iOS)
  webPush?: WebpushConfig // Web Push API options (browser)
}

/**
 * Module-level configuration object for push notifications.
 * - fcm → FCM-specific options
 * - expo → Expo-specific options (to be expanded)
 */
export interface PushModuleOptions {
  fcm?: FcmOptions
  expo?: any
}

/**
 * Async configuration interface for dynamic registration of the PushModule.
 * This allows fetching options from a config service, environment, or secret manager.
 */
export interface PushModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (...args: any[]) => Promise<PushModuleOptions> | PushModuleOptions
  inject?: any[] // Dependencies to inject into the factory
}
