import { ConfigService } from "@nestjs/config"
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from "@nestjs/typeorm"

import { IApp } from "./app.config"

export class DatabaseConfig {
  static getConfig(configService: ConfigService): TypeOrmModuleOptions {
    const shouldSynchorinze = configService.get<IApp>("app").env === "local"

    return {
      type: "postgres",
      host: configService.get("DB_HOST"),
      port: configService.get("DB_PORT"),
      username: configService.get("DB_USER"),
      password: configService.get("DB_PASSWORD"),
      database: configService.get("DB_NAME"),
      autoLoadEntities: true,
      synchronize: shouldSynchorinze,
      subscribers: [],
      migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],
      migrationsTableName: "migrations",
      logging: false
    }
  }
}

export const databaseConfigAsync: TypeOrmModuleAsyncOptions = {
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => DatabaseConfig.getConfig(configService),
  inject: [ConfigService]
}
