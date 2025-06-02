// import * as Mailgun from "mailgun.js"
import { Injectable } from "@nestjs/common"

import { MailgunMailOptions } from "./interface/config.interface"
import { IMailMessage, IMailOptionsConfigurator, IMailService } from "./interface/mail.service.interface"
import { ApiException } from "@/exceptions/api.exception"

@Injectable()
export class MailgunMailService implements IMailService, IMailOptionsConfigurator {
  //   constructor(private readonly mailQueue: MailQueueProducer) {}

  private mailgun: any
  //   private mailgun: Mailgun.MailgunClientOptions

  async send(_message: IMailMessage) {
    throw new Error("Method not implemented.")
  }

  setOptions(options: MailgunMailOptions): IMailService {
    if (!options.apiKey || !options.domain) {
      throw new ApiException("Invalid Mailgun Configuration", 500)
    }
    return this
  }

  //   async queue(message: IMailMessage) {
  //     await this.mailQueue.mailgun(message)
  //   }
}
