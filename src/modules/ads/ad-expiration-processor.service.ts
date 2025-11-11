import { AppQueues } from "@/constants"
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq"
import { Job } from "bullmq"
import { Ad } from "./entities/ad.entity"
import { AdsService } from "./ads.service"

@Processor(AppQueues.END_ADS)
export class AdExpirationProcessorService extends WorkerHost {
  constructor(private readonly adsService: AdsService) {
    super()
  }

  async process(job: Job<Ad>) {
    const ad = job.data
    this.adsService.update(ad, { status: "expired" })
  }

  @OnWorkerEvent("completed")
  onComplete(job: Job<Ad>) {
    // notify user
    console.error(`Completed job ${job.id}`)
  }
}
