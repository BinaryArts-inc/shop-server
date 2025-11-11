import { ConfigService, registerAs } from "@nestjs/config"

import { LogModuleAsyncOptions, LogModuleOptions } from "@/modules/services/log/interfaces/log.interface"

export default registerAs(
  "logging",
  (): LogModuleOptions => ({
    channels: {
      // Log in app error logs
      debuglog: {
        driver: "slack",
        url: process.env.SLACK_DEBUG_URL,
        username: process.env.SLACK_DEBUG_USER_NAME,
        level: "debug"
      },
      // typically multipurpose error logging
      errorlog: {
        driver: "sentry",
        publicKey: process.env.SENTRY_PUBLIC_KEY,
        host: process.env.SENTRY_HOST,
        projectId: process.env.SENTRY_PROJECT_ID,
        level: "error"
      },
      // monitor webhooks
      webhooklog: {
        driver: "slack",
        url: process.env.SLACK_URL,
        username: process.env.SLACK_USER_NAME,
        level: "info"
      }
    },

    defaultChannel: process.env.LOG_DEFAULT_CHANNEL || "errorlog"
  })
)

export class LoggingConfig {
  static getLogConfig(configService: ConfigService): LogModuleOptions {
    return configService.get<LogModuleOptions>("logging")
  }
}

export const logConfigAsync: LogModuleAsyncOptions = {
  useFactory: async (configService: ConfigService): Promise<LogModuleOptions> => LoggingConfig.getLogConfig(configService),
  inject: [ConfigService]
}
