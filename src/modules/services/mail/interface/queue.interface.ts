import { MailTransporter } from "./config.interface"
import { MailGunMessage, SesMessage, SmtpMessage } from "./messages.interface"

/**
 * Standardized payload structure for adding email jobs to a queue.
 *
 * Each queued job specifies:
 *  - `transport`: which mail provider to use ('smtp', 'ses', 'mailgun')
 *  - `data`: the corresponding message object for that provider
 *
 * This union type allows queue workers to safely process jobs
 * without ambiguity about the expected message format.
 */
export type MailQueuePayload =
  | { transport: Extract<MailTransporter, "mailgun">; data: MailGunMessage }
  | { transport: Extract<MailTransporter, "ses">; data: SesMessage }
  | { transport: Extract<MailTransporter, "smtp">; data: SmtpMessage }
