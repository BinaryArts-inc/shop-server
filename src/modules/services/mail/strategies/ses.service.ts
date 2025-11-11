import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"
import { HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common"

import { CONFIG_OPTIONS } from "../entities/config"
import { MailModuleOptions, SesMailOptions } from "../interface/config.interface"
import { MailStrategy, MailAddress } from "../interface/service.interface"

import { Mailable } from "../mailables/mailable"
import { MailQueueProducer } from "../queue/queue-producer.service"
import { SesMessage } from "../interface/messages.interface"

/**
 * Strategy for sending emails via AWS SES.
 * Implements MailStrategy for direct sending or queuing mails.
 */
@Injectable()
export class SesMailStrategy implements MailStrategy {
  private ses: SESv2Client
  public from: MailAddress

  constructor(
    private readonly mailQueue: MailQueueProducer,
    @Inject(CONFIG_OPTIONS) protected options: MailModuleOptions
  ) {
    this.from = options.from
  }

  /**
   * Send a fully-prepared SES message object directly.
   */
  async sendMessage(message: SesMessage): Promise<void> {
    if (!this.ses) {
      throw new HttpException("SES configuration not set", 500)
    }

    try {
      const command = new SendEmailCommand(message)
      await this.ses.send(command)
    } catch (error) {
      throw new InternalServerErrorException(`Failed to send Email: ${error}`)
    }
  }

  /**
   * Send a Mailable instance via SES.
   */
  async send(mail: Mailable) {
    if (!this.ses) {
      throw new HttpException("SES configuration not set", 500)
    }

    try {
      const command = new SendEmailCommand(mail.getSesMessage(this.from))
      await this.ses.send(command)
    } catch (error) {
      throw new InternalServerErrorException(`Failed to send Email: ${error}`)
    }
  }

  /**
   * Queue a Mailable for later sending using the MailQueueProducer.
   */
  async queue(mail: Mailable) {
    await this.mailQueue.dispatch("ses", mail)
  }

  /**
   * Configure SES client at runtime.
   * Must provide accessKeyId, secretAccessKey, and region.
   */
  setOptions(options: SesMailOptions): MailStrategy {
    if (!options.accessKeyId || !options.secretAccessKey || !options.region) {
      throw new HttpException("Invalid SES configuration", 500)
    }

    this.ses = new SESv2Client({
      region: options.region,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey
      }
    })

    return this
  }
}
