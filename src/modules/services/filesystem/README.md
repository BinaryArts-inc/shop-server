# FileSystem Module

The **FileSystemModule** provides a unified interface to work with multiple storage providers in a NestJS application, including:

- Local filesystem
- AWS S3
- DigitalOcean Spaces
- Google Cloud Storage
- Cloudinary

It supports synchronous and asynchronous module registration and offers a consistent API to upload, fetch, update, delete, and zip files/folders.

---

## Installation

```bash
npm install @aws-sdk/client-s3 archiver stream-buffers cloudinary
```

> Ensure you also have the required provider SDKs (e.g., `@google-cloud/storage` for Google, `aws-sdk` for S3/Spaces).

---

## Module Registration

### Synchronous

```ts
import { Module } from '@nestjs/common'
import { FileSystemModule } from './services/filesystem/filesystem.module'

@Module({
  imports: [
    FileSystemModule.register({
      default: 'mainStorage',
      clients: {
        mainStorage: {
          // client name can be anything
          driver: 's3', // driver determines the strategy
          key: process.env.AWS_KEY,
          secret: process.env.AWS_SECRET,
          bucket: process.env.AWS_BUCKET,
          region: process.env.AWS_REGION
        },
        backup: {
          // another client name
          driver: 'google',
          bucket: process.env.GCLOUD_BUCKET,
          keyFilename: 'path/to/keyfile.json',
          projectId: process.env.GCLOUD_PROJECT_ID
        }
      }
    })
  ]
})
export class AppModule {}
```

### Asynchronous

```ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { FileSystemModule } from './services/filesystem/filesystem.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    FileSystemModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        default: configService.get<string>('DEFAULT_FS_DRIVER'),
        clients: {
          local: {
            driver: 'local',
            root: configService.get<string>('LOCAL_ROOT'),
            baseUrl: configService.get<string>('LOCAL_BASE_URL')
          },
          s3: {
            driver: 's3',
            key: configService.get<string>('AWS_KEY'),
            secret: configService.get<string>('AWS_SECRET'),
            bucket: configService.get<string>('AWS_BUCKET'),
            region: configService.get<string>('AWS_REGION')
          }
          // other providers ...
        }
      }),
      inject: [ConfigService]
    })
  ]
})
export class AppModule {}
```

---

## Usage

Inject `FileSystemService` in your service or controller:

```ts
import { Injectable } from '@nestjs/common'
import { FileSystemService } from './filesystem.service'
import { FileUploadDto } from './interfaces/filesystem.interface'

@Injectable()
export class MyService {
  constructor(private readonly fileSystem: FileSystemService) {}

  async uploadFile(fileBuffer: Buffer) {
    const file: FileUploadDto = {
      buffer: fileBuffer,
      destination: 'uploads/myfile.txt',
      mimetype: 'text/plain'
    }

    const url = await this.fileSystem.upload(file)
    return url
  }

  async downloadFile(path: string) {
    const fileBuffer = await this.fileSystem.get(path)
    return fileBuffer
  }

  async getFileMeta(path: string) {
    return this.fileSystem.getMetaData(path)
  }

  async zipFolder(folderPath: string) {
    return this.fileSystem.zipFolder(folderPath)
  }

  async updateFile(path: string, newFile: FileUploadDto) {
    return this.fileSystem.update(path, newFile)
  }

  async deleteFile(path: string) {
    return this.fileSystem.delete(path)
  }
}
```

---

## Features

- **Multiple Storage Drivers**: Local, S3, Spaces, Google, Cloudinary
- **Unified API**: upload, get, getMetaData, update, delete, zipFolder
- **Default Driver**: Can be configured via `default` property
- **Strategy Injection**: Each driver has its own strategy class
- **Synchronous & Async Config**: Supports factory functions and dynamic options

---

## FileUploadDto

```ts
export interface FileUploadDto {
  buffer?: Buffer // Optional: raw file buffer
  filePath?: string // Optional: path to local file
  mimetype: string // Required: MIME type
  destination: string // Required: file path in storage
}
```

---

## FileMetada

```ts
export interface FileMetada {
  name: string
  size: string | number
  url: string
  mimeType: string
  lastModified: Date
}
```

---

## Example: Switching Storage Drivers

You can use clients and switch at runtime if needed:

```ts
const backupFs = fileSystem.getFileSystem('backup')
const mainFs = fileSystem.getFileSystem('mainStorage')

await backupFs.upload(file)
await mainFs.upload(file)
```

---

## Notes

- Ensure environment variables are properly set for each driver.
- Local driver requires write permissions on the specified `root` directory.
- DigitalOcean and AWS S3 use the same `S3Client` interface.
- Cloudinary and Google have provider-specific SDKs.
