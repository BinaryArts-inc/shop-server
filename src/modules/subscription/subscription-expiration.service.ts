import { AppQueues } from "@/constants"
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq"
import { SubscriptionService } from "./subscription.service"
import { Job } from "bullmq"
import { Subscription, SubscriptionEnum } from "./entities/subscription.entity"

@Processor(AppQueues.END_SUBSCRIPTION)
export class SubscriptionExpirationService extends WorkerHost {
  constructor(private readonly subscriptionService: SubscriptionService) {
    super()
  }

  async process(job: Job<Subscription>) {
    const subscription = job.data
    await this.subscriptionService.update(subscription, { status: SubscriptionEnum.INACTIVE })
  }

  @OnWorkerEvent("completed")
  onComplete(job: Job<Subscription>) {
    // notify user
    console.error(`Completed job ${job.id}`)
  }
}
