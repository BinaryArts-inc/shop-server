/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from "@nestjs/common"
import { FileUploadDto, IFileoptionsConfigurator, IFileSystemService } from "./interfaces/filesystem.interface"
import { GoogleStorageOptions } from "./interfaces/config.interface"
import { Storage, Bucket } from "@google-cloud/storage"
import * as fs from "fs"
import { ApiException } from "@/exceptions/api.exception"

@Injectable()
export class GoogleStorageService implements IFileSystemService, IFileoptionsConfigurator {
  private storage: Storage
  private bucket: Bucket
  private bucketName: string
  private publicUrl: string

  upload(file: FileUploadDto): Promise<string> {
    try {
      if (!fs.existsSync(file.filePath)) {
        throw new Error(`File does not exist ${file.filePath}`)
      }

      const fileStream = fs.createReadStream(file.filePath)
      const destination = file.destination

      const blob = this.bucket.file(destination)
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype
        },
        public: true
      })

      return new Promise((resolve, reject) => {
        blobStream.on("error", (error) => {
          reject(new ApiException(`Failed to upload file to Google `, 500))
        })

        blobStream.on("finish", async () => {
          await blob.makePublic()

          const publicUrl = this.publicUrl ? `${this.publicUrl}/${destination}` : `https://storage.googleapis.com/${this.bucketName}/${destination}`

          resolve(publicUrl)
        })

        fileStream.pipe(blobStream)
      })
    } catch (error) {
      throw new ApiException(`Failed to upload to Google`, 500)
    }
  }
  async get(path: string): Promise<Buffer> {
    try {
      const [fileContent] = await this.bucket.file(path).download()
      return fileContent
    } catch (error) {
      throw new ApiException(`Failed to download fle from Google Storage: ${error.message}`, 500)
    }
  }
  async update(path: string, file: FileUploadDto): Promise<string> {
    await this.delete(path)
    return this.upload(file)
  }
  async delete(path: string): Promise<void> {
    try {
      await this.bucket.file(path).delete()
    } catch (error) {
      throw new ApiException(`Failed to delete file from Google Storage: ${error.message}`, 500)
    }
  }
  setOptions(options: GoogleStorageOptions): IFileSystemService {
    this.storage = new Storage({
      projectId: options.projectId,
      keyFilename: options.keyFilename
    })
    ;(this.bucketName = options.bucket), (this.bucket = this.storage.bucket(options.bucket))
    this.publicUrl = options.publicUrl

    return this
  }
}
