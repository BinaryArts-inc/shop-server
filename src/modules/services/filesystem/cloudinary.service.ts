import { Injectable } from "@nestjs/common"
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary"
import * as fs from "fs"
import { FileUploadDto, IFileoptionsConfigurator, IFileSystemService } from "./interfaces/filesystem.interface"
import { CloudinaryStorageOptions } from "./interfaces/config.interface"
import { ApiException } from "@/exceptions/api.exception"

export type CloudinaryType = UploadApiErrorResponse | UploadApiResponse

@Injectable()
export class CloudinaryService implements IFileSystemService, IFileoptionsConfigurator {
  private options: CloudinaryStorageOptions

  setOptions(options: CloudinaryStorageOptions): IFileSystemService {
    this.options = options
    cloudinary.config({
      cloud_name: options.cloud_name,
      api_key: options.api_key,
      api_secret: options.api_secret
    })
    return this
  }

  async upload(file: FileUploadDto): Promise<string> {
    try {
      if (!fs.existsSync(file.filePath)) {
        throw new Error(`File does not exist ${file.filePath}`)
      }
      const result = await cloudinary.uploader.upload(file.filePath, {
        resource_type: file.mimetype.startsWith("video") ? "video" : file.mimetype.startsWith("image") ? "image" : "raw"
      })
      fs.unlinkSync(file.filePath)
      return result.secure_url
    } catch (error) {
      throw new ApiException(`Failed to upload file to Cloudinary: ${error.message}`, 500)
    }
  }

  async get(publicId: string): Promise<any> {
    // Cloudinary does not provide direct file download via SDK
    return cloudinary.url(publicId)
  }

  async update(publicId: string, file: FileUploadDto): Promise<string> {
    await this.delete(publicId)
    return this.upload(file)
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "auto" })
    } catch (error) {
      throw new ApiException(`Failed to delete file from Cloudinary: ${error.message}`, 500)
    }
  }
}
