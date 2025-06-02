import * as fs from "fs"
import * as path from "path"
import handlebars from "handlebars"
import { Inject, Injectable } from "@nestjs/common"

import { IMailMessage, IMailService } from "./interface/mail.service.interface"
import { IMailClients, MailModuleOptions, MailTransporter, SmtpMailOptions, SesMailOption, MailgunMailOptions } from "./interface/config.interface"

import { SesMailService } from "./ses.service"
import { SmtpMailService } from "./smtp.service"
import { CONFIG_OPTIONS } from "./entities/config"
import { MailgunMailService } from "./mailgun.service"
import { ApiException } from "@/exceptions/api.exception"

@Injectable()
export class MailService implements IMailService {
  private sesMailService: SesMailService
  private mailgunMailService: MailgunMailService
  private smtpMailService: SmtpMailService

  constructor(
    @Inject(CONFIG_OPTIONS) protected options: MailModuleOptions //   private readonly mailQueue: MailQueueProducer
  ) {
    if (!options.default || !options.clients[options.default]) {
      throw new ApiException(`Invalid default transporter: ${options.default}`, 500)
    }
    this.default = options.default
    this.clients = options.clients

    this.sesMailService = new SesMailService()
    this.mailgunMailService = new MailgunMailService()
    this.smtpMailService = new SmtpMailService()
    //  this.sesMailService = new SesMailService(mailQueue)
    //  this.mailgunMailService = new MailgunMailService(mailQueue)
    //  this.smtpMailService = new SmtpMailService(mailQueue)
  }

  private default: MailTransporter

  private clients: IMailClients

  async send(message: IMailMessage) {
    const transporter = this.getTransporter(this.default)

    await transporter.send(message)
  }

  //   async queue(message: IMailMessage): Promise<void> {
  //     switch (this.default) {
  //       case "smtp":
  //         await this.mailQueue.smtp(message)
  //         break

  //       case "ses":
  //         await this.mailQueue.ses(message)
  //         break

  //       case "mailgun":
  //         await this.mailQueue.mailgun(message)
  //         break

  //       default:
  //         throw new ApiException("invalid transporter", 500)
  //     }
  //   }

  getTransporter(transporter: MailTransporter): IMailService {
    const options = this.clients[transporter]

    if (!options) {
      throw new ApiException(`Transporter ${transporter} not configured`, 500)
    }

    switch (transporter) {
      case "smtp":
        return this.smtpMailService.setOptions(options as SmtpMailOptions)

      case "ses":
        return this.sesMailService.setOptions(options as SesMailOption)

      case "mailgun":
        return this.mailgunMailService.setOptions(options as MailgunMailOptions)

      default:
        throw new ApiException("invalid transporter", 500)
    }
  }

  static parseHtml(templateName: string, data: Record<string, any>): string {
    try {
      const filePath = path.join(__dirname, `../../../../../views/${templateName}`)

      // Read the template file
      const templateSource = fs.readFileSync(filePath, "utf-8")

      //compile the template
      const template = handlebars.compile(templateSource)

      //return the parsed Html with the data
      return template(data)
    } catch (error) {
      throw new Error(`Failed to parse HTML template: ${error.message}`)
    }
  }
}
