import { ConfigModule, ConfigService, registerAs } from "@nestjs/config"
import { MailModuleAsyncOptions, MailModuleOptions } from "../modules/services/mail/interface/config.interface"

export default registerAs(
  "mail",
  (): MailModuleOptions => ({
    default: "smtp",
    clients: {
      smtp: {
        transport: "smtp",
        host: process.env.SMTP_HOST,
        port: 587,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        }
      },
      ses: {
        transport: "ses",
        region: "",
        accessKeyId: "",
        secretAccessKey: ""
      },
      mailgun: {
        transport: "mailgun",
        apiKey: "",
        domain: ""
      }
    }
  })
)

export class MailConfig {
  static getConfig(configService: ConfigService): MailModuleOptions {
    return {
      default: "smtp",
      clients: {
        smtp: {
          transport: "smtp",
          host: configService.get("SMTP_HOST"),
          port: 587,
          auth: {
            user: configService.get("SMTP_EMAIL"),
            pass: configService.get("SMTP_PASSWORD")
          }
        },
        ses: {
          transport: "ses",
          region: "",
          accessKeyId: "",
          secretAccessKey: ""
        },
        mailgun: {
          transport: "mailgun",
          apiKey: "",
          domain: ""
        }
      }
    }
  }
}

export const mailConfigAsync: MailModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => MailConfig.getConfig(configService),
  inject: [ConfigService]
}
