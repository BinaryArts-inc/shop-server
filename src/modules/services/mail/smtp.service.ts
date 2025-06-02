import { Injectable } from "@nestjs/common"
import * as nodemailer from "nodemailer"
import { IMailMessage, IMailOptionsConfigurator, IMailService } from "./interface/mail.service.interface"
import { SmtpMailOptions } from "./interface/config.interface"
// import { MailQueueProducer } from "@/modules/queues/mail/mail.producer"

@Injectable()
export class SmtpMailService implements IMailService, IMailOptionsConfigurator {
  //   constructor() {} // private readonly mailQueue: MailQueueProducer

  private transporter: nodemailer.Transporter

  setOptions(options: SmtpMailOptions): IMailService {
    if (!options.host || !options.port || !options.auth.pass || !options.auth.user) throw new Error("Smtp config not set")

    this.transporter = nodemailer.createTransport(options)
    return this
  }

  async send(message: IMailMessage) {
    if (!this.transporter) {
      throw new Error("SMTP configuration not set")
    }

    return this.transporter.sendMail({ ...message })
  }

  //   async queue(message: IMailMessage) {
  //     await this.mailQueue.smtp(message)
  //   }
}
