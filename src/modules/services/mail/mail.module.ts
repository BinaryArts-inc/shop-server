import { DynamicModule, Module } from "@nestjs/common"
import { MailModuleAsyncOptions, MailModuleOptions } from "./interface/config.interface"
import { CONFIG_OPTIONS } from "./entities/config"
import { MailService } from "./mail.service"

@Module({})
export class MailModule {
  static register(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        MailService
      ],
      exports: [MailService]
    }
  }

  static registerAsync(options: MailModuleAsyncOptions): DynamicModule {
    return {
      module: MailModule,
      imports: [...(options.imports || [])],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || []
        },
        MailService
      ],
      exports: [MailService]
    }
  }
}
