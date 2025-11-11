# Push Module

A flexible Push Notification module supporting **Firebase Cloud Messaging (FCM)** and **Expo notifications**. Designed for modular integration with NestJS services.

---

## Features

* Send push notifications via FCM or Expo.
* Support for:

  * Single tokens
  * Multiple tokens
  * Topics
  * Conditions
* Async and sync configuration.
* Optional Firebase integration.
* Type-safe message payloads.
* Queue support placeholder (future feature).

---

## Installation

```bash
npm install @nestjs/common @nestjs/config firebase-admin expo-server-sdk
```

---

## Module Registration

### 1. Synchronous Registration

```ts
import { Module } from '@nestjs/common';
import { PushModule } from '@/services/push/push.module';

@Module({
  imports: [
    PushModule.register({
      fcm: {
        image: 'https://example.com/logo.png',
      },
      expo: {}, // Optional Expo configuration
    }),
  ],
})
export class AppModule {}
```

### 2. Asynchronous Registration (Recommended for dynamic configs)

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { FirebaseModule } from '@/services/firebase/firebase.module';
import { PushModule, PushModuleAsyncOptions, PushModuleOptions } from '@/services/push';

export default registerAs('push', (): PushModuleOptions => ({
  fcm: {
    image: 'https://example.com/logo.png',
  },
}));

export const pushConfigAsync: PushModuleAsyncOptions = {
  imports: [ConfigModule, FirebaseModule],
  useFactory: async (configService: ConfigService) => {
    return configService.get<PushModuleOptions>('push');
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    PushModule.registerAsync(pushConfigAsync),
  ],
})
export class AppModule {}
```

> **Note:** If FCM is enabled, `FirebaseModule` must be imported.

---

## Usage

Inject `PushService` anywhere in your app:

```ts
import { Injectable } from '@nestjs/common';
import { PushService } from '@/services/push/push.service';
import { FcmMessage } from '@/services/push/messages/fcm.message';
import { ExpoMessage } from '@/services/push/messages/expo.message';

@Injectable()
export class NotificationService {
  constructor(private readonly pushService: PushService) {}

  async sendFcmNotification(token: string) {
    const message = new FcmMessage({
      token,
      title: 'Hello',
      body: 'This is a test notification',
    });

    await this.pushService.send(message);
  }

  async sendExpoNotification(recipients: string[]) {
    const message = new ExpoMessage({
      recipients,
      title: 'Hello',
      body: 'This is a test notification',
    });

    await this.pushService.send(message);
  }
}
```

---

## Message Types

### FCM (`FcmMessage`)

* **Single token:** `token`
* **Multiple tokens:** `tokens`
* **Topic:** `topic`
* **Condition:** `condition`
* Optional fields: `data`, `imageUrl`, `android`, `apns`, `webpush`, `priority`

Methods:

* `toTokenPayload(defaults?: FcmOptions): TokenMessage`
* `toTokensPayload(defaults?: FcmOptions): MulticastMessage`
* `toTopicPayload(defaults?: FcmOptions): TopicMessage`
* `toConditionPayload(defaults?: FcmOptions): ConditionMessage`

---

### Expo (`ExpoMessage`)

* **Single recipient:** `to`
* **Multiple recipients:** `recipients`
* Optional fields: `data`, `sound`, `badge`, `channelId`

Methods:

* `toSinglePayload(): ExpoPushMessage`
* `toMultiplePayload(): ExpoPushMessage[]`

---

## Notes

* **Queue support:** Placeholder exists in `PushService.queue()` for future implementation.
* **Expo:** Strategy not implemented yet; calling `send()` with an `ExpoMessage` will throw an error.
* **FirebaseService:** Required if using FCM.
* **Configuration:** Clients can provide **any key name** for their provider options; it does not have to match the driver name.

---

This README now fully documents:

1. Sync/async module registration
2. Firebase dependency
3. PushService usage
4. FCM & Expo message types
5. Notes on unimplemented features
