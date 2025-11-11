import * as nodemailer from "nodemailer"
import { HttpException, Inject, Injectable } from "@nestjs/common"

import { MailModuleOptions, SmtpMailOptions } from "../interface/config.interface"
import { MailStrategy, MailAddress } from "../interface/service.interface"

import { Mailable } from "../mailables/mailable"
import { CONFIG_OPTIONS } from "../entities/config"
import { MailQueueProducer } from "../queue/queue-producer.service"
import { SmtpMessage } from "../interface/messages.interface"

/**
 * Strategy for sending emails via SMTP using Nodemailer.
 * Implements MailStrategy to support sending, queueing, and runtime configuration.
 */
@Injectable()
export class SmtpMailStrategy implements MailStrategy {
  private transporter: nodemailer.Transporter
  private options: SmtpMailOptions
  public from: MailAddress

  constructor(
    private readonly mailQueue: MailQueueProducer,
    @Inject(CONFIG_OPTIONS) protected _options: MailModuleOptions
  ) {
    this.from = _options.from
  }

  /**
   * Configure SMTP transport at runtime.
   * Must provide host, port, and authentication credentials.
   */
  setOptions(options: SmtpMailOptions): MailStrategy {
    if (!options.host || !options.port || !options.auth.pass || !options.auth.user) throw new HttpException("Smtp config not set", 500)

    this.options = options
    this.transporter = nodemailer.createTransport(options)
    return this
  }

  /**
   * Send a Mailable instance immediately via SMTP.
   */
  async send(mail: Mailable) {
    if (!this.transporter) {
      throw new HttpException("SMTP configuration not set", 500)
    }

    try {
      await this.transporter.verify()
      return this.transporter.sendMail(mail.getSmtpMessage(this.from))
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  /**
   * Queue a Mailable for later sending via MailQueueProducer.
   * Passes optional queue options from the client configuration.
   */
  async queue(mail: Mailable) {
    await this.mailQueue.dispatch("smtp", mail, this.options.queueOptions)
  }

  /**
   * Send a fully-prepared SMTP message directly.
   */
  async sendMessage(message: SmtpMessage): Promise<void> {
    if (!this.transporter) {
      throw new HttpException("SMTP configuration not set", 500)
    }

    try {
      await this.transporter.verify()
      return this.transporter.sendMail(message)
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }
}
