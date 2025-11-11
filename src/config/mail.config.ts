import { ConfigModule, ConfigService, registerAs } from "@nestjs/config"
import { MailModuleAsyncOptions, MailModuleOptions } from "../modules/services/mail/interface/config.interface"

export default registerAs(
  "mail",
  (): MailModuleOptions => ({
    from: {
      address: process.env.MAIL_FROM_ADDRESS,
      name: process.env.MAIL_FROM_NAME
    },
    default: process.env.DEFAULT_MAILER || "smtp",
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
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
      }
    }
  })
)

export const mailConfigAsync: MailModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get<MailModuleOptions>("mail")
    return config
  },
  inject: [ConfigService]
}
