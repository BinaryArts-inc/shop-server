import { ConfigModule, ConfigService, registerAs } from "@nestjs/config"

import { PaymentModuleAsyncOptions, PaymentModuleOption } from "@/modules/services/payments/interfaces/config.interface"

function getOptions(): PaymentModuleOption {
  return {
    default: "paystack",
    providers: {
      paystack: {
        secret: process.env.PAYSTACK_SECRET || "",
        subscriptionCode: process.env.PAYSTACK_SUB_CODE || ""
      }
    }
  }
}

export const paymentConfigAsync: PaymentModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get<PaymentModuleOption>("payment")
    return config
  },
  inject: [ConfigService]
}

export default registerAs("payment", getOptions)
