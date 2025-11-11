import { JobsOptions, Queue } from "bullmq"
import { InjectQueue } from "@nestjs/bullmq"
import { Inject, Injectable } from "@nestjs/common"

import { Mailable } from "../mailables/mailable"
import { QueueRegistry } from "@queues/queues.registry"
import { CONFIG_OPTIONS } from "../entities/config"
import { MailQueuePayload } from "../interface/queue.interface"
import { MailModuleOptions, MailTransporter } from "../interface/config.interface"

@Injectable()
export class MailQueueProducer {
  private readonly defaultJobOptions: JobsOptions = {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: true,
    backoff: {
      type: "exponential",
      delay: 2000
    }
  }

  constructor(
    @InjectQueue(QueueRegistry.MAIL) private readonly queue: Queue<MailQueuePayload>,
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
  ) {}

  /**
   * Dispatch a mail job to the queue.
   */
  async dispatch(transporter: MailTransporter, mail: Mailable, options?: JobsOptions) {
    const payload = this.createPayload(transporter, mail)
    await this.queue.add(transporter, payload, { ...this.defaultJobOptions, ...options })
  }

  /**
   * Generate the correct payload based on transport type.
   */
  private createPayload(transporter: MailTransporter, mail: Mailable): MailQueuePayload {
    const payloadMap: Record<MailTransporter, () => MailQueuePayload> = {
      mailgun: () => ({ transport: "mailgun", data: mail.getMailGunMessage(this.options.from) }),
      ses: () => ({ transport: "ses", data: mail.getSesMessage(this.options.from) }),
      smtp: () => ({ transport: "smtp", data: mail.getSmtpMessage(this.options.from) })
    }

    const generator = payloadMap[transporter]
    if (!generator) throw new Error(`Unsupported mail transporter: ${transporter}`)

    return generator()
  }
}
