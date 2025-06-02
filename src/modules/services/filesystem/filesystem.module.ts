import { DynamicModule, Module } from '@nestjs/common'
import { FileSystemModuleAsynOptions, FileSystemModuleOptions } from './interfaces/config.interface'
import { CONFIG_OPTIONS } from './entities/config'
import { FileSystemService } from './filesystem.service'

@Module({})
export class FileSystemModule {
   static register(options: FileSystemModuleOptions): DynamicModule {
      return {
         module: FileSystemModule,
         providers: [
            {
               provide: CONFIG_OPTIONS,
               useValue: options,
            },
            FileSystemService,
         ],
         exports: [FileSystemService],
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
               inject: options.inject || [],
            },
            FileSystemService,
         ],
         exports: [FileSystemService],
      }
   }
}
