import { HttpException, Inject, Injectable } from "@nestjs/common"

import { CONFIG_OPTIONS } from "../entities/config"
import { MAIL_STRATEGY } from "../entities/strategies"
import { SesMailStrategy } from "../strategies/ses.service"
import { SmtpMailStrategy } from "../strategies/smtp.service"
import { MailQueuePayload } from "../interface/queue.interface"
import { MailgunMailStrategy } from "../strategies/mailgun.service"
import { MailClientsMap, MailModuleOptions, MailTransporter } from "../interface/config.interface"
import { IMailQueueService, MailAddress, MailStrategy } from "../interface/service.interface"

/**
 * Service responsible for consuming the mail queue and sending emails.
 *
 * Uses the configured mail strategies (SMTP, SES, Mailgun) and dispatches
 * messages to the appropriate strategy based on the transport type.
 */
@Injectable()
export class MailQueueService implements IMailQueueService {
  /**
   * Default sender address
   */
  public from: MailAddress

  /**
   * Configured clients mapping (keyed by client name)
   */
  private clients: MailClientsMap

  /**
   * Mapping from transport type to strategy instance
   */
  private strategyMap: Record<MailTransporter, MailStrategy> = {
    smtp: this.smtpMailService,
    ses: this.sesMailService,
    mailgun: this.mailgunMailService
  }

  constructor(
    @Inject(CONFIG_OPTIONS)
    protected options: MailModuleOptions,
    @Inject(MAIL_STRATEGY.ses)
    private readonly sesMailService: SesMailStrategy,
    @Inject(MAIL_STRATEGY.mailgun)
    private readonly mailgunMailService: MailgunMailStrategy,
    @Inject(MAIL_STRATEGY.smtp)
    private readonly smtpMailService: SmtpMailStrategy
  ) {
    if (!options.default || !options.clients[options.default]) {
      throw new HttpException(`Invalid default transporter: ${options.default}`, 500)
    }
    this.from = options.from
    this.clients = options.clients
  }

  /**
   * Send a queued mail payload using the appropriate transport strategy.
   *
   * Steps:
   * 1. Look up the client options for the payload's transport.
   * 2. Retrieve the corresponding strategy instance.
   * 3. Configure the strategy with the client options.
   * 4. Send the message.
   *
   * @param data Mail payload containing transport type and message data
   */
  async send(data: MailQueuePayload): Promise<void> {
    const options = this.clients[data.transport]
    await this.strategyMap[data.transport].setOptions(options).sendMessage(data.data)
  }
}
