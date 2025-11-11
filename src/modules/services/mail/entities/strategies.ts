// src/services/mail/entities/strategies.ts

/**
 * Named injection tokens for supported mail delivery strategies.
 *
 * These tokens allow the Mail service to register and resolve different
 * underlying mail providers via NestJS's dependency injection system.
 *
 * Example usage:
 *  - MAIL_STRATEGY.smtp   -> Injects an SMTP-based mail service
 *  - MAIL_STRATEGY.ses    -> Injects an AWS SES-based mail service
 *  - MAIL_STRATEGY.mailgun -> Injects a Mailgun-based mail service
 */
export const MAIL_STRATEGY = {
  smtp: "SMTP_MAIL_SERVICE",
  ses: "SES_MAIL_SERVICE",
  mailgun: "MAILGUN_MAIL_SERVICE"
}
