import * as Sentry from "@sentry/node"
import { Injectable } from "@nestjs/common"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

import { ErrorContext, ILogOptionsConfigurator, ILogService, LogLevel, SentryLogConfiguration } from "../interfaces/log.interface"

@Injectable()
export class SentryLogStrategy implements ILogService, ILogOptionsConfigurator {
  private initialized = false
  logLevel: LogLevel
  logLevels: LogLevel[]

  setOptions(options: SentryLogConfiguration): this {
    if (!this.initialized) {
      const { host, publicKey, projectId } = options

      Sentry.init({
        dsn: `https://${publicKey}@${host}/${projectId}`,
        integrations: [nodeProfilingIntegration()],
        tracesSampleRate: 1.0,
        profileSessionSampleRate: 1.0,
        profileLifecycle: "trace",
        sendDefaultPii: true,
        environment: process.env.NODE_ENV || "development"
      })

      this.initialized = true
    }

    return this
  }

  log(context: ErrorContext): void {
    this.sendToSentry(context, "info")
  }

  error(context: ErrorContext): void {
    this.sendToSentry(context, "error")
  }

  warn(context: ErrorContext): void {
    this.sendToSentry(context, "warning")
  }

  debug(context: ErrorContext): void {
    this.sendToSentry(context, "debug")
  }

  verbose(context: ErrorContext): void {
    this.sendToSentry(context, "debug")
  }

  fatal(context: ErrorContext): void {
    this.sendToSentry(context, "fatal")
  }

  setLogLevels(levels: LogLevel[]): this {
    this.logLevels = levels
    return this
  }

  private sendToSentry(context: ErrorContext, level: Sentry.SeverityLevel) {
    Sentry.withScope((scope) => {
      scope.setLevel(level)

      scope.setTags({
        method: context.method,
        path: context.path,
        status: context.status.toString()
      })

      scope.setUser({ id: context.userId })
      scope.setExtra("stackTrace", context.stackTrace)
      scope.setExtra("timestamp", context.timeStamp)
      scope.setExtra("cause", context.cause)

      if (level === "error" || level === "fatal") {
        Sentry.captureException(new Error(context.message))
      } else {
        Sentry.captureMessage(context.message)
      }
    })
  }
}
