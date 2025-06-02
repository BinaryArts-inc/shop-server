import { Injectable } from "@nestjs/common"
import { FileUploadDto, IFileoptionsConfigurator, IFileSystemService } from "./interfaces/filesystem.interface"
import { S3Options } from "./interfaces/config.interface"
import { DeleteObjectCommand, GetObjectCommand, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import * as fs from "fs"
import { ApiException } from "@/exceptions/api.exception"

@Injectable()
export class S3Service implements IFileSystemService, IFileoptionsConfigurator {
  private client: S3Client
  private bucket: string
  private endpoint: string

  async upload(file: FileUploadDto): Promise<string> {
    try {
      if (!fs.existsSync(file.filePath)) {
        throw new Error(`File does not exist ${file.filePath}`)
      }
      const fileStream = fs.createReadStream(file.filePath)
      const key = file.destination

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileStream,
          ACL: "public-read" as ObjectCannedACL,
          ContentType: file.mimetype
        })
      )

      return `${this.endpoint}/${this.bucket}/${key}`
    } catch (error) {
      if (error.name === "NoSuchBucket") {
        throw new ApiException(`Bucket ${this.bucket} does not exist`, 500)
      }
      if (error.name === "AccessDenied") {
        throw new ApiException("Access denied to AWS. Check your credentials.", 500)
      }
      throw new ApiException(`Failed to upload file to AWS: ${error.message}`, 500)
    }
  }

  async get(path: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: path
      })
    )

    return Buffer.from(await response.Body!.transformToByteArray())
  }

  async update(path: string, file: FileUploadDto): Promise<string> {
    await this.delete(path)
    return this.upload(file)
  }
  async delete(path: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path
      })
    )
  }
  setOptions(options: S3Options): IFileSystemService {
    this.bucket = options.bucket
    this.endpoint = options.endpoint || `https://${options.bucket}.s3.${options.region}.amazonaws.com` // saving to amazon
    // this.endpoint = options.endpoint ||  `htts://${options.bucket}.s3.${options.region}.digitaloceanspaces.com`; // saving to digitalocean

    this.client = new S3Client({
      credentials: {
        accessKeyId: options.key,
        secretAccessKey: options.secret
      },
      endpoint: options.endpoint,
      forcePathStyle: true,
      region: options.region
    })

    return this
  }
}
