import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"
import { PaymentModuleOption } from "@/modules/services/payments/interfaces/config.interface"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as crypto from "crypto"

@Injectable()
export class PaystackWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp()
    const request = http.getRequest()

    const signature = request.headers["x-paystack-signature"]
    if (!signature) {
      return false
    }
    const secret = this.configService.get<PaymentModuleOption>("payment").providers.paystack.secret

    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(request.body)).digest("hex")

    const signatureBuffer = Buffer.from(signature)
    const hashBuffer = Buffer.from(hash)

    try {
      const isValid = signatureBuffer.length === hashBuffer.length && crypto.timingSafeEqual(signatureBuffer, hashBuffer)

      if (!isValid) {
        throw new UnAuthorizedException("Invalid signature")
      }

      return true
    } catch (error) {
      throw new UnAuthorizedException("Invalid Signature")
    }
  }
}
