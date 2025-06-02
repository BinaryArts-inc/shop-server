import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { SesMailOption } from "./interface/config.interface"
import { IMailMessage, IMailOptionsConfigurator, IMailService } from "./interface/mail.service.interface"
import { SendEmailCommand, SESClient, SendEmailCommandInput } from "@aws-sdk/client-ses"
import { ApiException } from "@/exceptions/api.exception"
// import { MailQueueProducer } from "@/modules/queues/mail/mail.producer"

@Injectable()
export class SesMailService implements IMailService, IMailOptionsConfigurator {
  //   constructor(private readonly mailQueue: MailQueueProducer) {}

  private ses: SESClient

  async send(message: IMailMessage) {
    if (!this.ses) {
      throw new Error("SES configuration not set")
    }

    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: Array.isArray(message.to) ? message.to : [message.to]
      },

      Message: {
        Subject: {
          Data: message.subject,
          Charset: "UTF-8"
        },
        Body: {
          Text: message.text ? { Data: message.text, Charset: "UTF_8" } : undefined,
          Html: message.html ? { Data: message.html, Charset: "UTF-8" } : undefined
        }
      },
      Source: message.from
    }

    if (message.attachments?.length) {
      throw new InternalServerErrorException("SES transporter does not support attachments directly. Consider using SMTP for attachments")
    }

    try {
      const command = new SendEmailCommand(params)
      await this.ses.send(command)
    } catch (error) {
      throw new InternalServerErrorException(`Failed to send Email: ${error}`)
    }
  }

  //   async queue(message: IMailMessage) {
  //     await this.mailQueue.ses(message)
  //   }

  setOptions(options: SesMailOption): IMailService {
    if (!options.accessKeyId || !options.secretAccessKey || !options.region) {
      throw new ApiException("Invalid SES configuration", 500)
    }

    this.ses = new SESClient({
      region: options.region,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey
      }
    })

    return this
  }
}
