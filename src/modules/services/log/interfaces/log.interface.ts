import { LoggerService, LogLevel as ILogLevel, ModuleMetadata } from "@nestjs/common"
import { LogDriver } from "./drivers.interface"

export type LogLevel = ILogLevel | "info"

export interface ILogService extends LoggerService {
  /**
   * Write a 'log' level log.
   */
  log(context: ErrorContext): void

  /**
   * Write an 'error' level log.
   */
  error(context: ErrorContext): void
  /**
   * Write a 'warn' level log.
   */
  warn(context: ErrorContext): void
  /**
   * Write a 'debug' level log.
   */
  debug(context: ErrorContext): void
  /**
   * Write a 'verbose' level log.
   */
  verbose(context: ErrorContext): void

  /**
   * Write a 'fatal' level log.
   */
  fatal(context: ErrorContext): void

  /**
   * Set log levels.
   * @param levels log levels
   */
  setLogLevels?(levels: LogLevel[]): this
}

export interface ILogOptionsConfigurator {
  setOptions(options: SlackLogConfiguration | SentryLogConfiguration): ILogService
}

export type LogConfiguration = {
  driver: LogDriver
  level: LogLevel | "info"
}

export type SlackLogConfiguration = LogConfiguration & {
  driver: "slack"
  url: string
  username: string
}

export type SentryLogConfiguration = LogConfiguration & {
  driver: "sentry"
  publicKey: string
  host: string
  projectId: string
}

export type LogChannels = {
  [key: string]: SlackLogConfiguration | SentryLogConfiguration
}

export type LogModuleOptions<T extends LogChannels = LogChannels> = {
  channels: T
  defaultChannel: Extract<keyof T, string>
}

export interface LogModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: any[]
  useFactory?: (...args: any[]) => Promise<LogModuleOptions> | LogModuleOptions
}

export type ErrorContext = {
  level?: LogLevel | "info"
  status: number
  path: string
  method: string
  message: string
  timeStamp: string
  userId: string
  stackTrace: string
  cause: string
}

export type ErrorReportContext = {
  message: string
  context?: Record<string, string>
}
