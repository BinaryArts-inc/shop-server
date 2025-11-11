import { HttpModule } from "@nestjs/axios"
import { DynamicModule, Module } from "@nestjs/common"

import { CONFIG_OPTIONS } from "./constants/config"
import { PaymentsService } from "./payments.service"
import { PAYMENT_STRATEGY } from "./constants/strategies"
import { PaystackStrategy } from "./strategies/paystack.strategy"
import { PaymentModuleAsyncOptions, PaymentModuleOption } from "./interfaces/config.interface"

@Module({})
export class PaymentsModule {
  static register(options: PaymentModuleOption): DynamicModule {
    return {
      module: PaymentsModule,
      imports: [HttpModule],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        {
          provide: PAYMENT_STRATEGY.paystack,
          useClass: PaystackStrategy
        },
        PaymentsService
      ],
      exports: [PaymentsService, CONFIG_OPTIONS, ...Object.values(PAYMENT_STRATEGY)]
    }
  }
  static registerAsync(options: PaymentModuleAsyncOptions): DynamicModule {
    return {
      module: PaymentsModule,
      imports: [...(options.imports || []), HttpModule],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || []
        },
        {
          provide: PAYMENT_STRATEGY.paystack,
          useClass: PaystackStrategy
        },
        PaymentsService
      ],
      exports: [PaymentsService, CONFIG_OPTIONS, ...Object.values(PAYMENT_STRATEGY)]
    }
  }
}
