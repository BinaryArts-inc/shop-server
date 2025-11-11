import { TypeOrmModule } from "@nestjs/typeorm"
import { DynamicModule, Module } from "@nestjs/common"

import { MailModule } from "../mail/mail.module"
import { Notification } from "./entities/notification.entity"
import { NotificationsService } from "./notifications.service"
import { NOTIFICATION_CONFIG_OPTION } from "./entities/config"
import { NotificationModuleAsyncOptions, NotificationModuleOptions } from "./interfaces/config.interface"
import { PushModule } from "../push/push.module"

@Module({})
export class NotificationsModule {
  static register(options: NotificationModuleOptions): DynamicModule {
    const imports = [TypeOrmModule.forFeature([Notification])]

    if (options.mail) {
      imports.push(MailModule.register(options.mail))
    }

    if (options.push) {
      imports.push(PushModule.register(options.push))
    }

    return {
      module: NotificationsModule,
      imports,
      providers: [
        NotificationsService,
        {
          provide: NOTIFICATION_CONFIG_OPTION,
          useValue: options
        }
      ],
      exports: [NotificationsService]
    }
  }

  static registerAsync(options: NotificationModuleAsyncOptions): DynamicModule {
    const imports = [TypeOrmModule.forFeature([Notification]), ...(options.imports || [])]

    const providers = [
      NotificationsService,
      {
        provide: NOTIFICATION_CONFIG_OPTION,
        useFactory: options.useFactory || (() => ({})),
        inject: options.inject || []
      }
    ]

    return {
      module: NotificationsModule,
      imports,
      providers,
      exports: [NotificationsService, NOTIFICATION_CONFIG_OPTION]
    }
  }
}
