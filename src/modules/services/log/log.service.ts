import { Inject, Injectable } from "@nestjs/common"
import { ErrorContext, ILogService, LogChannels, LogModuleOptions, SentryLogConfiguration, SlackLogConfiguration } from "./interfaces/log.interface"

import { LOG_STRATEGY } from "./entities/strategies"
import { LogChannelException } from "@/exceptions/log-channel.exception"

import { SlackLogStrategy } from "./strategies/slack.strategy"
import { SentryLogStrategy } from "./strategies/sentry.strategy"
import { ConsoleLogStrategy } from "./strategies/console.strategy"
import { CONFIG_OPTIONS } from "./entities/config"

@Injectable()
export class LogService implements ILogService {
  private channels: LogChannels
  private defaultChannel: keyof LogChannels

  constructor(
    @Inject(CONFIG_OPTIONS)
    protected options: LogModuleOptions,

    @Inject(LOG_STRATEGY.console)
    private readonly c: ConsoleLogStrategy,

    @Inject(LOG_STRATEGY.slack)
    private readonly slack: SlackLogStrategy,

    @Inject(LOG_STRATEGY.sentry)
    private readonly sentry: SentryLogStrategy
  ) {
    this.defaultChannel = options.defaultChannel
    this.channels = options.channels
  }

  //  builder design pattern
  channel(channel: string): ILogService {
    const config = this.channels[channel]

    if (!config) {
      throw new LogChannelException()
    }

    return this.getService(config)
  }

  log(context: ErrorContext) {
    const config = this.channels[this.defaultChannel]

    if (!config) {
      throw new LogChannelException("No default Log Channel Specified")
    }

    const service = this.getService(config)

    service.log(context)
  }

  error(context: ErrorContext) {
    const config = this.channels[this.defaultChannel]

    if (!config) {
      throw new LogChannelException("No default Log Channel Specified")
    }

    config.level = "error"

    const service = this.getService(config)

    service.error(context)
  }

  warn(context: ErrorContext) {
    const config = this.channels[this.defaultChannel]

    if (!config) {
      throw new LogChannelException("No default Log Channel Specified")
    }

    config.level = "warn"

    const service = this.getService(config)

    service.warn(context)
  }

  debug(context: ErrorContext) {
    const config = this.channels[this.defaultChannel]

    if (!config) {
      throw new LogChannelException("No default Log Channel Specified")
    }

    config.level = "debug"

    const service = this.getService(config)

    service.debug(context)
  }

  verbose(context: ErrorContext) {
    const config = this.channels[this.defaultChannel]

    if (!config) {
      throw new LogChannelException("No default Log Channel Specified")
    }

    config.level = "verbose"

    const service = this.getService(config)

    service.verbose(context)
  }

  fatal(context: ErrorContext) {
    const config = this.channels[this.defaultChannel]

    if (!config) {
      throw new LogChannelException("No default Log Channel Specified")
    }

    config.level = "fatal"

    const service = this.getService(config)

    service.fatal(context)
  }

  private getService(channel: SlackLogConfiguration | SentryLogConfiguration): ILogService {
    switch (channel.driver) {
      case "slack":
        return this.slack.setOptions(channel)
      case "sentry":
        return this.sentry.setOptions(channel)
      default:
        return this.c.setOptions()
    }
  }
}
