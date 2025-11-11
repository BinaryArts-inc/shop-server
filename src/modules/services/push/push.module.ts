import { DynamicModule, Module } from "@nestjs/common"

import { PushService } from "./push.service"
import { PUSH_CONFIG_OPTIONS } from "./entities/config"
import { FirebaseModule } from "../firebase/firebase.module"
import { PushModuleAsyncOptions, PushModuleOptions } from "./interfaces/config.interface"

@Module({})
export class PushModule {
  static register(options: PushModuleOptions): DynamicModule {
    const imports = []

    if (options.fcm) {
      imports.push(FirebaseModule)
    }

    return {
      module: PushModule,
      imports,
      providers: [
        {
          provide: PUSH_CONFIG_OPTIONS,
          useValue: options
        },
        PushService
      ],
      exports: [PushService]
    }
  }

  static registerAsync(options: PushModuleAsyncOptions): DynamicModule {
    return {
      module: PushModule,
      imports: options.imports,
      providers: [
        {
          provide: PUSH_CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || []
        },
        PushService
      ],
      exports: [PushService]
    }
  }
}
