import { JobsOptions } from "bullmq"
import { ModuleMetadata } from "@nestjs/common"

import { MailAddress } from "./service.interface"

/**
 * Configuration object passed to the MailModule.
 *
 * - `from`: Default sender address applied to outgoing emails.
 * - `clients`: A map of configured mail clients (SMTP, SES, Mailgun).
 * - `default`: The key of the client to be used by default.
 */
export interface MailModuleOptions {
  from: MailAddress
  clients: MailClientsMap
  default: keyof MailClientsMap
}

/**
 * Optional queue configuration for job-based email sending.
 */
export interface QueueConfig {
  queueOptions?: JobsOptions
}

/**
 * Map of mail client identifiers to their specific configuration.
 * Example: { primary: SmtpMailOptions, backup: SesMailOptions }
 */
export type MailClientsMap = Record<string, SmtpMailOptions | SesMailOptions | MailgunMailOptions>

/**
 * SMTP client configuration.
 */
export type SmtpMailOptions = QueueConfig & {
  transport: "smtp"
  host: string
  port: number
  url?: string
  encryption?: "ssl" | "tls" | "starttls"
  auth: {
    user: string
    pass: string
  }
}

/**
 * AWS SES client configuration.
 */
export type SesMailOptions = QueueConfig & {
  transport: "ses"
  region: string
  accessKeyId: string
  secretAccessKey: string
}

/**
 * Mailgun client configuration.
 */
export type MailgunMailOptions = QueueConfig & {
  transport: "mailgun"
  apiKey: string
  domain: string
}

/**
 * Supported mail transport types.
 */
export type MailTransporter = "smtp" | "ses" | "mailgun"

/**
 * Union type of all possible mail client configurations.
 */
export type MailClientOptions = SmtpMailOptions | SesMailOptions | MailgunMailOptions

/**
 * Async options for configuring MailModule dynamically.
 * Mirrors the NestJS ModuleAsyncOptions pattern.
 */
export interface MailModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (...args: any[]) => Promise<MailModuleOptions> | MailModuleOptions
  inject?: any[]
}
