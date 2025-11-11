import { Module, DynamicModule } from "@nestjs/common"
import { LogService } from "./log.service"
import { CONFIG_OPTIONS } from "./entities/config"
import { LOG_STRATEGY } from "./entities/strategies"
import { ConsoleLogStrategy } from "./strategies/console.strategy"
import { SlackLogStrategy } from "./strategies/slack.strategy"
import { SentryLogStrategy } from "./strategies/sentry.strategy" // 🆕 add this

import { LogModuleAsyncOptions, LogModuleOptions } from "./interfaces/log.interface"

@Module({})
export class LogModule {
  static registerAsync(options: LogModuleAsyncOptions): DynamicModule {
    return {
      module: LogModule,
      imports: options.imports || [],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || []
        },
        {
          provide: LOG_STRATEGY.console,
          useClass: ConsoleLogStrategy
        },
        {
          provide: LOG_STRATEGY.slack,
          useClass: SlackLogStrategy
        },
        {
          provide: LOG_STRATEGY.sentry,
          useClass: SentryLogStrategy
        },
        LogService
      ],
      exports: [LogService, CONFIG_OPTIONS, LOG_STRATEGY.console, LOG_STRATEGY.slack, LOG_STRATEGY.sentry]
    }
  }

  static register(options: LogModuleOptions): DynamicModule {
    return {
      module: LogModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        {
          provide: LOG_STRATEGY.console,
          useClass: ConsoleLogStrategy
        },
        {
          provide: LOG_STRATEGY.slack,
          useClass: SlackLogStrategy
        },
        {
          provide: LOG_STRATEGY.sentry,
          useClass: SentryLogStrategy
        },
        LogService
      ],
      exports: [LogService, CONFIG_OPTIONS, LOG_STRATEGY.console, LOG_STRATEGY.slack, LOG_STRATEGY.sentry]
    }
  }
}
