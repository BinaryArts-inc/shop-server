import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { WebhookService } from "./webhook.service"
import { PaystackWebhookGuard } from "./guard/paystack.guard"
import { Public } from "../auth/decorators/public.decorator"
import { PaystackChargeSuccess, PaystackTransferData, PaystackWebhook } from "../services/payments/interfaces/paystack.interface"

@Public()
@Controller("webhooks")
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @UseGuards(PaystackWebhookGuard)
  @Post("paystack")
  async handlePaystackWebhook(@Body() body: PaystackWebhook) {
    console.error("webhook ran")

    if (body.event === "charge.success") {
      this.webhookService.handleChargeSuccess(body.data as PaystackChargeSuccess)
    } else if (body.event === "invoice.create") {
      this.webhookService.handleInvoiceCreate(body.data as PaystackChargeSuccess)
    } else if (body.event === "transfer.success") {
      this.webhookService.handleTransferSuccess(body.data as PaystackTransferData)
    } else if (body.event === "transfer.failed") {
      this.webhookService.handleTransferFailed(body.data as PaystackTransferData)
    } else if (body.event === "transfer.reversed") {
      this.webhookService.handleTransferFailed(body.data as PaystackTransferData)
    }
  }
}
