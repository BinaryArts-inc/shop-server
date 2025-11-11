import { DynamicModule, Module } from "@nestjs/common"

import { CONFIG_OPTIONS } from "./entities/config"
import { FileSystemService } from "./filesystem.service"
import { FileSystemModuleAsynOptions, FileSystemModuleOptions } from "./interfaces/config.interface"
import { FILESYSTEM_STRATEGY } from "./entities/strategies"
import { LocalFsStrategy } from "./strategies/local.strategy"
import { S3Strategy } from "./strategies/aws.strategy"
import { GoogleStorageStrategy } from "./strategies/google.strategy"
import { DigitalOceanStrategy } from "./strategies/digitalocean.strategy"
import { CloudinaryStrategy } from "./strategies/cloudinary.service"

@Module({})
export class FileSystemModule {
  static register(options: FileSystemModuleOptions): DynamicModule {
    return {
      module: FileSystemModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        {
          provide: FILESYSTEM_STRATEGY.local,
          useClass: LocalFsStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.aws,
          useClass: S3Strategy
        },
        {
          provide: FILESYSTEM_STRATEGY.google,
          useClass: GoogleStorageStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.digitalOcean,
          useClass: DigitalOceanStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.cloudinary,
          useClass: CloudinaryStrategy
        },
        FileSystemService
      ],
      exports: [
        FileSystemService,
        CONFIG_OPTIONS,
        FILESYSTEM_STRATEGY.local,
        FILESYSTEM_STRATEGY.aws,
        FILESYSTEM_STRATEGY.google,
        FILESYSTEM_STRATEGY.digitalOcean,
        FILESYSTEM_STRATEGY.cloudinary
      ]
    }
  }

  static registerAsync(options: FileSystemModuleAsynOptions): DynamicModule {
    return {
      module: FileSystemModule,
      imports: [...(options.imports || [])],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || []
        },
        {
          provide: FILESYSTEM_STRATEGY.local,
          useClass: LocalFsStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.aws,
          useClass: S3Strategy
        },
        {
          provide: FILESYSTEM_STRATEGY.google,
          useClass: GoogleStorageStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.digitalOcean,
          useClass: DigitalOceanStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.cloudinary,
          useClass: CloudinaryStrategy
        },
        FileSystemService
      ],
      exports: [
        FileSystemService,
        CONFIG_OPTIONS,
        FILESYSTEM_STRATEGY.local,
        FILESYSTEM_STRATEGY.aws,
        FILESYSTEM_STRATEGY.google,
        FILESYSTEM_STRATEGY.digitalOcean,
        FILESYSTEM_STRATEGY.cloudinary
      ]
    }
  }
}
