# NestJS Mail Service

A fully-featured, reusable NestJS mail module supporting **SMTP**, **AWS SES**, and **Mailgun** with **queue-based sending**, **dynamic transport selection**, and **templated mailables**. Designed to integrate seamlessly with **NestJS projects**.

---

## Features

* **Multiple mail transports**: SMTP, SES, Mailgun
* **Queue support**: Asynchronous mail dispatch with BullMQ
* **Mailables**: Reusable classes for emails with:

  * Envelope (to, from, cc, bcc, replyTo)
  * Content (HTML or text templates)
  * Attachments
  * Headers
* **Dynamic transport selection**: Send via default client or custom client at runtime
* **Async or sync configuration** via environment variables or programmatic config
* **Strategy-based architecture**: Easily extendable to new mail services

---

## Installation

```bash
npm install @nestjs/common @nestjs/config @nestjs/bullmq nodemailer aws-sdk mailgun.js form-data axios handlebars
```

---

## Configuration

### Environment Variables

```env
MAIL_FROM_ADDRESS=your@email.com
MAIL_FROM_NAME=Your App
DEFAULT_MAILER=smtp

SMTP_HOST=smtp.example.com
SMTP_EMAIL=username
SMTP_PASSWORD=password

MAILGUN_API_KEY=key-xxxx
MAILGUN_DOMAIN=mg.example.com
```

---

### Mail Module Configuration

#### Synchronous Configuration

```ts
import { MailModule } from './services/mail/mail.module'
import mailConfig from './config/mail.config'

@Module({
  imports: [
    MailModule.register(mailConfig())
  ]
})
export class AppModule {}
```

#### Asynchronous Configuration

```ts
import { MailModule } from './services/mail/mail.module'
import { mailConfigAsync } from './config/mail.config'

@Module({
  imports: [
    MailModule.registerAsync(mailConfigAsync)
  ]
})
export class AppModule {}
```

---

## Usage

### Sending an Email Directly

```ts
import { MailService } from './services/mail/mail.service'
import { Injectable } from '@nestjs/common'
import { Mailable } from './services/mail/mailables/mailable'

@Injectable()
export class ExampleService {
  constructor(private readonly mailService: MailService) {}

  async sendMail(mail: Mailable) {
    await this.mailService.send(mail)
  }
}
```

### Queueing an Email

```ts
await this.mailService.queue(mail)
```

### Sending via a Specific Client

```ts
const transporter = this.mailService.getTransporter('primary')
await transporter.send(mail)
```

---

## Mailables

Mailables are reusable email templates. Each mailable must implement:

* `envelope()`: Define `from`, `to`, `cc`, `bcc`, etc.
* `content()`: Return HTML/text content
* `attachments()`: Return attachments
* `headers()`: Return custom headers

Example:

```ts
import { Mailable } from './services/mail/mailables/mailable'
import { Content } from './services/mail/mailables/content'
import { Envelope } from './services/mail/mailables/envelope'

export class WelcomeEmail extends Mailable {
  constructor(private readonly user: any) { super() }

  envelope() {
    return new Envelope({ to: this.user.email, subject: 'Welcome!' })
  }

  content() {
    return new Content({ html: 'emails.welcome', with: { name: this.user.name } })
  }

  attachments() {
    return []
  }

  headers() {
    return []
  }
}
```

---

## Mail Strategies

* **SMTP** – Uses `nodemailer`
* **SES** – AWS SES via `@aws-sdk/client-sesv2`
* **Mailgun** – via `mailgun.js`

All strategies implement:

* `send(mail: Mailable)`
* `queue(mail: Mailable)`
* `sendMessage(message: MailMessageUnion)`
* `setOptions(options: MailClientOptions)`

---

## Queue System

Uses **BullMQ** with a dedicated `MAIL` queue:

* **MailQueueProducer** – Dispatch mail to the queue
* **MailQueueConsumer** – Processes queued mails
* **MailQueueService** – Handles mail sending from the queue

---

## Extending the Module

You can add new mail strategies by implementing the `MailStrategy` interface and registering them with the module:

```ts
@Injectable()
export class CustomMailStrategy implements MailStrategy {
  // implement send, queue, sendMessage, setOptions
}
```

---

## License

MIT License

---

This README captures:

* Features
* Configuration options
* Usage examples (sync & async, queue, custom transport)
* Mailables structure
* Queue architecture
* Extensibility

---
