import axios from "axios"
import { Injectable } from "@nestjs/common"

import { LogChannelException } from "@/exceptions/log-channel.exception"
import { ErrorContext, ILogOptionsConfigurator, ILogService, LogLevel, SlackLogConfiguration } from "../interfaces/log.interface"

@Injectable()
export class SlackLogStrategy implements ILogService, ILogOptionsConfigurator {
  private url: string
  private username: string
  private configuredLevel: LogLevel
  private configuredLevels: LogLevel[] = []

  private readonly LOG_LEVELS: Record<LogLevel, { emoji: string; color: string }> = {
    info: { emoji: "💡", color: "#2196F3" },
    error: { emoji: "🛑", color: "#FF0000" },
    warn: { emoji: "⚠️", color: "#FFA000" },
    fatal: { emoji: "🔥", color: "#D32F2F" },
    debug: { emoji: "🐞", color: "#673AB7" },
    verbose: { emoji: "🔍", color: "#4CAF50" },
    log: { emoji: "📜", color: "#607D8B" }
  }

  setOptions(options: SlackLogConfiguration): this {
    if (!options.url) {
      throw new LogChannelException("Slack URL is required")
    }

    if (!options.username) {
      throw new LogChannelException("Slack username is required")
    }

    this.url = options.url
    this.username = options.username
    this.configuredLevel = options.level
    return this
  }

  setLogLevels(levels: LogLevel[]): this {
    this.configuredLevels = levels
    return this
  }

  log(context: ErrorContext): void {
    this.send("info", context)
  }

  error(context: ErrorContext): void {
    this.send("error", context)
  }

  warn(context: ErrorContext): void {
    this.send("warn", context)
  }

  debug(context: ErrorContext): void {
    this.send("debug", context)
  }

  verbose(context: ErrorContext): void {
    this.send("verbose", context)
  }

  fatal(context: ErrorContext): void {
    this.send("fatal", context)
  }

  private send(level: LogLevel, context: ErrorContext): void {
    const levelsToSend = this.configuredLevels.length ? this.configuredLevels : [this.configuredLevel ?? level]
    if (levelsToSend.includes(level)) {
      this.sendToSlack(level, context)
    }
  }

  private async sendToSlack(level: LogLevel, context: ErrorContext): Promise<void> {
    if (!this.url || !this.username) {
      throw new LogChannelException("Slack logging options not configured properly")
    }

    const meta = this.LOG_LEVELS[level] ?? this.LOG_LEVELS.info
    const message = this.formatMessage(context.message, context, meta.emoji)

    try {
      await axios.post(this.url, {
        username: this.username,
        attachments: [
          {
            color: meta.color,
            text: message,
            mrkdwn_in: ["text"]
          }
        ]
      })
    } catch (e) {
      console.error("Slack log error:", e)
    }
  }

  private formatMessage(title: string, context?: ErrorContext, emoji?: string): string {
    let message = `${emoji} ${title}`

    if (context && Object.keys(context).length > 0) {
      message += "\n```\n"
      for (const [key, value] of Object.entries(context)) {
        if (value) {
          message += `${this.formatKey(key)}: ${value}\n`
        }
      }
      message += "```"
    }

    return message
  }

  private formatKey(key: string): string {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }
}
