import { ModuleMetadata } from "@nestjs/common"
import { MailModuleOptions } from "../../mail/interface/config.interface"
import { PushModuleOptions } from "../../push/interfaces/config.interface"

export interface NotificationModuleOptions {
  mail?: MailModuleOptions
  push?: PushModuleOptions
}

export interface NotificationModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (...args: any[]) => Promise<NotificationModuleOptions> | NotificationModuleOptions
  inject?: any[]
}
