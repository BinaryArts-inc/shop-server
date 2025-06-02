import { ModuleMetadata } from "@nestjs/common"

export interface MailModuleOptions {
  clients: IMailClients
  default: MailTransporter
}

export type IMailClients = {
  smtp: SmtpMailOptions
  ses: SesMailOption
  mailgun: MailgunMailOptions
}

export type SmtpMailOptions = {
  transport: "smtp"
  host: string
  port: number
  url?: string
  encryption?: string
  secure?: boolean
  service?: string
  auth: {
    user: string
    pass: string
  }
}

export type SesMailOption = {
  transport: "ses"
  region: string
  accessKeyId: string
  secretAccessKey: string
}

export type MailgunMailOptions = {
  transport: "mailgun"
  apiKey: string
  domain: string
}

export type MailTransporter = "smtp" | "ses" | "mailgun"

export type MailTransporterOption = MailgunMailOptions | SesMailOption | SmtpMailOptions

export interface MailModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (...args: any[]) => Promise<MailModuleOptions> | MailModuleOptions
  inject?: any[]
}
