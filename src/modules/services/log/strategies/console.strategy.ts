/* eslint-disable no-console */
import { Injectable } from "@nestjs/common"
import { ErrorContext, ILogOptionsConfigurator, ILogService, LogLevel } from "../interfaces/log.interface"

@Injectable()
export class ConsoleLogStrategy implements ILogService, ILogOptionsConfigurator {
  private levels: LogLevel[] = []

  setLogLevels(levels: LogLevel[]): this {
    this.levels = levels
    return this
  }

  setOptions(): this {
    return this
  }

  log(context: ErrorContext): void {
    this.output("log", context)
  }

  error(context: ErrorContext): void {
    this.output("error", context)
  }

  warn(context: ErrorContext): void {
    this.output("warn", context)
  }

  debug(context: ErrorContext): void {
    this.output("debug", context)
  }

  verbose(context: ErrorContext): void {
    this.output("verbose", context)
  }

  fatal(context: ErrorContext): void {
    this.output("fatal", context)
  }

  private output(level: LogLevel, context: ErrorContext): void {
    if (this.levels.length > 0 && !this.levels.includes(level)) return

    const logMessage = {
      level,
      message: context.message,
      method: context.method,
      path: context.path,
      status: context.status,
      userId: context.userId,
      timeStamp: context.timeStamp,
      stackTrace: context.stackTrace,
      cause: context.cause
    }

    const formatted = `[${level.toUpperCase()}] ${context.message}`

    switch (level) {
      case "error":
      case "fatal":
        console.error(formatted, logMessage)
        break
      case "warn":
        console.warn(formatted, logMessage)
        break
      case "debug":
        console.debug(formatted, logMessage)
        break
      case "verbose":
        console.info(formatted, logMessage)
        break
      case "log":
      case "info":
      default:
        console.log(formatted, logMessage)
    }
  }
}
