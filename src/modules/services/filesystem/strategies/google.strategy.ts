import * as fs from "fs"
import archiver from "archiver"
import { WritableStreamBuffer } from "stream-buffers"
import { Storage, Bucket } from "@google-cloud/storage"
import { HttpException, Inject, Injectable } from "@nestjs/common"

import { CONFIG_OPTIONS } from "../entities/config"
import { FileMetada, FileUploadDto, IFileSystemService } from "../interfaces/filesystem.interface"
import { FileSystemModuleOptions, GoogleStorageOptions } from "../interfaces/config.interface"

@Injectable()
export class GoogleStorageStrategy implements IFileSystemService {
  private storage: Storage
  private bucket: Bucket
  private bucketName: string
  private publicUrl?: string
  private config: GoogleStorageOptions

  constructor(@Inject(CONFIG_OPTIONS) protected readonly fsOptions: FileSystemModuleOptions) {
    const config = fsOptions.clients.google

    this.bucketName = config.bucket
    this.publicUrl = config.publicUrl

    this.storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename
    })

    if (this.bucketName) {
      this.bucket = this.storage.bucket(this.bucketName)
    }
  }

  async upload(file: FileUploadDto): Promise<string> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    if (!file.filePath && !file.buffer) {
      throw new HttpException("No filePath or buffer provided", 400)
    }

    try {
      const destination = file.destination
      const blob = this.bucket.file(destination)

      const stream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype
        },
        resumable: false
      })

      return new Promise((resolve, reject) => {
        stream.on("error", (error) => {
          console.error("Google upload error:", error)
          reject(new HttpException(`Failed to upload file to Google`, 500))
        })

        stream.on("finish", async () => {
          await blob.makePublic()
          const publicUrl = this.publicUrl ? `${this.publicUrl}/${destination}` : `https://storage.googleapis.com/${this.bucketName}/${destination}`

          resolve(publicUrl)
        })

        if (file.buffer) {
          stream.end(file.buffer)
        } else {
          const readStream = fs.createReadStream(file.filePath)
          readStream.pipe(stream)
        }
      })
    } catch (error: any) {
      throw new HttpException(`Failed to upload to Google: ${error.message}`, 500)
    }
  }

  async get(path: string): Promise<Buffer> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    try {
      const [fileContent] = await this.bucket.file(path).download()
      return fileContent
    } catch (error: any) {
      throw new HttpException(`Failed to download file from Google Storage: ${error.message}`, 500)
    }
  }

  async getMetaData(path: string): Promise<FileMetada> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    const [metadata] = await this.bucket.file(path).getMetadata()

    return {
      name: metadata.name,
      size: Number(metadata.size) || 0,
      mimeType: metadata.contentType,
      url: this.publicUrl ? `${this.publicUrl}/${path}` : `https://storage.googleapis.com/${this.bucketName}/${path}`,
      lastModified: metadata.timeStorageClassUpdated ? new Date(metadata.timeStorageClassUpdated) : undefined
    }
  }

  async zipFolder(folderPath: string): Promise<Buffer> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    const output = new WritableStreamBuffer({
      initialSize: 1000 * 1024,
      incrementAmount: 1000 * 1024
    })

    const archive = archiver("zip", { zlib: { level: 9 } })

    return new Promise<Buffer>((resolve, reject) => {
      archive.pipe(output)

      archive.on("error", (err) => {
        console.error("Archiver error:", err)
        reject(new HttpException("Failed to zip folder", 500))
      })

      output.on("finish", () => {
        const buffer = output.getContents()
        if (!buffer) {
          return reject(new HttpException("Failed to generate zip buffer", 500))
        }
        resolve(buffer)
      })

      output.on("error", (err) => {
        console.error("Output buffer error:", err)
        reject(new HttpException("Failed to create zip", 500))
      })

      const fileStream = this.bucket.getFilesStream({ prefix: folderPath })

      fileStream.on("data", async (file) => {
        try {
          if (!file.name.endsWith("/")) {
            const fileBuffer = await this.get(file.name)
            const filename = file.name.replace(`${folderPath}/`, "")
            archive.append(fileBuffer, { name: filename })
          }
        } catch (err) {
          console.error(`Failed to fetch ${file.name}`, err)
        }
      })

      fileStream.on("end", async () => {
        try {
          await archive.finalize()
        } catch (err) {
          reject(new HttpException("Error finalizing archive", 500))
        }
      })

      fileStream.on("error", (err) => {
        console.error("Google file stream error:", err)
        reject(new HttpException("Failed to read files from folder", 500))
      })
    })
  }

  async update(path: string, file: FileUploadDto): Promise<string> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    await this.delete(path)
    return this.upload(file)
  }

  async delete(path: string): Promise<void> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    try {
      await this.bucket.file(path).delete()
    } catch (error: any) {
      throw new HttpException(`Failed to delete file from Google Storage: ${error.message}`, 500)
    }
  }

  private checkConfig(options: GoogleStorageOptions): string {
    if (!options.driver) return "Invalid driver for Google Storage"
    if (!options.bucket) return "No Google storage bucket specified"
    if (!options.projectId) return "No Google project ID provided"
    if (!options.keyFilename) return "No Google credentials key file path provided"
    return ""
  }
}
