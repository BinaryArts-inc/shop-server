import * as fs from "fs"
import { Injectable } from "@nestjs/common"
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client, ObjectCannedACL } from "@aws-sdk/client-s3"
import { FileUploadDto, IFileoptionsConfigurator, IFileSystemService } from "../interfaces/filesystem.interface"
import { ApiException } from "@/exceptions/api.exception"
import { DOSpacesOptions } from "../interfaces/config.interface"

@Injectable()
export class DigitalOceanStrategy implements IFileSystemService, IFileoptionsConfigurator {
  private clients: S3Client
  private bucket: string
  private endpoint: string
  private cdnEndPoint: string

  async upload(file: FileUploadDto): Promise<string> {
    console.log("i got here", this.bucket, file)

    if (!file.filePath && !file.buffer) {
      throw new ApiException("valid file required", 500)
    }

    if (file.filePath && !fs.existsSync(file.filePath)) {
      throw new ApiException(`File does not exist at path: ${file.filePath}`, 500)
    }

    try {
      await this.clients.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: file.destination,
          Body: file.buffer || fs.createReadStream(file.filePath),
          ContentType: file.mimetype,
          ACL: "public-read" as ObjectCannedACL
        })
      )

      return `${this.endpoint}/${this.bucket}/${file.destination}`
    } catch (error) {
      console.log("error", error)

      if (error.name === `NoSuchBucket`) {
        throw new ApiException(`No bucket`, 500)
      }
      if (error.name === "AccessDenied") {
        throw new ApiException(`Access denied`, 500)
      }
      throw new ApiException(error.message, 500)
    }
  }

  async get(path: string): Promise<Buffer> {
    const response = await this.clients.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: path
      })
    )

    return Buffer.from(await response.Body.transformToByteArray())
  }

  async update(path: string, file: FileUploadDto): Promise<string> {
    await this.delete(path)
    return this.upload(file)
  }

  async delete(path: string): Promise<void> {
    await this.clients.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path
      })
    )
  }

  setOptions(options: DOSpacesOptions): IFileSystemService {
    const error = this.checkConfig(options)
    if (error) throw new ApiException(error, 500)

    const endpoint = `https://${options.bucket}/${options.region}.digitaloceanspaces.com`

    this.bucket = options.bucket
    this.endpoint = endpoint
    this.cdnEndPoint = `https://${options.bucket}/${options.region}.cdn.digitaloceanspaces.com`

    this.clients = new S3Client({
      credentials: {
        accessKeyId: options.key,
        secretAccessKey: options.secret
      },

      endpoint: endpoint,
      forcePathStyle: true,
      region: options.region
    })

    return this
  }

  private checkConfig(options: DOSpacesOptions) {
    if (!options.driver) {
      return "Invalid driver"
    }

    if (!options.bucket) {
      return "No storage bucket"
    }

    if (!options.region) {
      return "Region not specified"
    }

    if (!options.secret || !options.key) {
      return "Invalid credentials"
    }

    return ""
  }
}
