import axios from "axios"
import Mailgun from "mailgun.js"
import formData = require("form-data")
import { HttpException, Inject, Injectable } from "@nestjs/common"

import { CONFIG_OPTIONS } from "../entities/config"
import { MailgunMailOptions, MailModuleOptions } from "../interface/config.interface"
import { MailAddress, MailStrategy } from "../interface/service.interface"

import { Mailable } from "../mailables/mailable"
import { MailQueueProducer } from "../queue/queue-producer.service"
import { MailGunMessage } from "../interface/messages.interface"

/**
 * Strategy for sending emails via Mailgun.
 * Implements the MailStrategy interface for sending and queuing mails.
 */
@Injectable()
export class MailgunMailStrategy implements MailStrategy {
  private mailgun: ReturnType<Mailgun["client"]>
  private domain: string
  public from: MailAddress

  constructor(
    private readonly mailQueue: MailQueueProducer,
    @Inject(CONFIG_OPTIONS)
    protected options: MailModuleOptions
  ) {
    this.from = options.from
  }

  /**
   * Configure the Mailgun strategy at runtime.
   * Must be called before sending messages.
   */
  setOptions(options: MailgunMailOptions): MailStrategy {
    if (!options.apiKey || !options.domain) {
      throw new HttpException("Invalid Mailgun Configuration", 500)
    }

    this.domain = options.domain

    const mg = new Mailgun(formData)
    this.mailgun = mg.client({
      username: "api",
      key: options.apiKey
    })

    return this
  }

  /**
   * Send a Mailable instance immediately via Mailgun.
   */
  async send(mail: Mailable): Promise<void> {
    if (!this.mailgun) {
      throw new HttpException("Mailgun not initialized. Did you forget to call setOptions?", 500)
    }

    try {
      const message = mail.getMailGunMessage(this.from)
      if (Array.isArray(message.attachment) && message.attachment.length > 0) {
        message.attachment = await this.resolveAttachments(message.attachment)
      }

      await this.mailgun.messages.create(this.domain, { ...message, template: undefined })
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Queue a Mailable to be sent later using the MailQueueProducer.
   */
  async queue(mail: Mailable): Promise<void> {
    await this.mailQueue.dispatch("mailgun", mail)
  }

  /**
   * Send a fully prepared MailGunMessage directly.
   * Intended for use by queue consumers or internal logic.
   */
  async sendMessage(message: MailGunMessage) {
    if (!this.mailgun) {
      throw new HttpException("Mailgun not initialized. Did you forget to call setOptions?", 500)
    }

    try {
      if (Array.isArray(message.attachment) && message.attachment.length > 0) {
        message.attachment = await this.resolveAttachments(message.attachment)
      }

      await this.mailgun.messages.create(this.domain, { ...message, template: undefined })
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Converts attachment URLs to Buffers for Mailgun.
   * Only processes attachments whose data is a URL starting with "http".
   */
  private async resolveAttachments(attachments: MailGunMessage["attachment"]): Promise<typeof attachments> {
    return Promise.all(
      attachments.map(async (attachment) => {
        if (typeof attachment.data === "string" && attachment.data.startsWith("http")) {
          const { data } = await axios.get<ArrayBuffer>(attachment.data, {
            responseType: "arraybuffer"
          })
          return { ...attachment, data: Buffer.from(data) }
        }
        return attachment
      })
    )
  }
}
