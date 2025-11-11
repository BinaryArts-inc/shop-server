# @your-org/notifications

NestJS **Notifications Module** supporting multiple channels:

* Database (stores notifications in SQL DB)
* Broadcast (in-memory RxJS stream)
* Mail (optional, integrates with your MailModule)
* SMS (optional)
* Push (optional)

This module is designed to be flexible, allowing optional channel services and async configuration.

---

## Installation

```bash
npm install @intuneteq/nest/notifications
```

Ensure you also have `@nestjs/typeorm` installed if you plan to use the database channel.

---

## Database Table

The module creates a table `notification` with the following schema:

| Column       | Type      | Description                             |
| ------------ | --------- | --------------------------------------- |
| id           | uuid      | Primary key                             |
| type         | string    | Type of the notification                |
| notifiableId | string    | ID of the user or entity being notified |
| data         | jsonb     | Payload of the notification             |
| isRead       | boolean   | Whether the notification has been read  |
| createdAt    | timestamp | When the notification was created       |

> ⚠ **TypeORM Limitations:**
>
> * Only works with databases supported by TypeORM (PostgreSQL, MySQL, SQLite, etc.).
> * If using a database that doesn’t support `jsonb` (e.g., MySQL < 5.7), you must adjust the `data` column type.
> * Automatic table creation requires `synchronize: true` in your TypeORM config; otherwise, you must run migrations manually.
> * Relations, complex queries, or multiple tenants require additional customization.

---

## Usage

### Synchronous Registration

```ts
import { Module } from '@nestjs/common';
import { NotificationsModule } from '@your-org/notifications';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    NotificationsModule.register({
      mail: { /* MailModuleOptions */ }
    })
  ]
})
export class AppModule {}
```

### Async Registration

```ts
import { NotificationsModule } from '@your-org/notifications';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NotificationsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        mail: configService.get('mail') // Optional: MailModuleOptions
      }),
      inject: [ConfigService]
    })
  ]
})
export class AppModule {}
```

---

## Sending Notifications

All notifications extend the abstract `NotificationContract` class:

```ts
import { NotificationsService } from '@your-org/notifications';
import { TestingNotification } from '@your-org/notifications';

@Injectable()
export class SomeService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async sendTest(user: INotifiable) {
    const notification = new TestingNotification(user)
      .enqueue()           // Optional: queue for background sending
      .sendTo(user.email); // Optional: override recipient

    this.notificationsService.notify(notification);
  }
}
```

---

## Notification Channels

| Channel     | Description                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `database`  | Saves notification to the database table.                                                                |
| `broadcast` | Emits notification to an in-memory RxJS stream (subscribe via `NotificationsService.subscribe(userId)`). |
| `mail`      | Sends email using your MailModule. Optional and requires configuration.                                  |
| `sms`       | Send SMS notifications (to be implemented).                                                              |
| `push`      | Send push notifications (to be implemented).                                                             |

---

## Subscribing to Broadcasts

```ts
const stream$ = notificationsService.subscribe(userId);
stream$.subscribe(payload => {
  console.log('New broadcast notification', payload);
});
```

---

## Optional Mail Integration

To enable mail notifications:

1. Provide `MailModuleOptions` when registering the module.
2. Mail notifications are only sent if `mailService` is available.

---

## Advanced Features

* **Queueing:** Use `.enqueue()` on a notification to queue it for background sending.
* **Dynamic Recipient:** Use `.sendTo(email)` to override the default recipient.
* **Attachments:** Email attachments can be added via `NotificationContract.attachments`.

---

## Summary

The `@your-org/notifications` module provides:

* Flexible channel system (database, broadcast, mail, etc.)
* Async configuration
* Database persistence (`notification` table)
* Optional mail integration
* Event-driven broadcast subscriptions

> ⚠ **Note:** TypeORM database features depend on your underlying database. Use migrations for production and check JSON column support if not using PostgreSQL.

