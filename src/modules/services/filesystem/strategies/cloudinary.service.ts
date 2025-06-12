// import * as fs from "fs"
import { Inject, Injectable } from "@nestjs/common"
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary"

import { ApiException } from "@/exceptions/api.exception"
import { FileUploadDto, IFileoptionsConfigurator, IFileSystemService } from "../interfaces/filesystem.interface"
import { CloudinaryStorageOptions, FileSystemModuleOptions } from "../interfaces/config.interface"
import { CONFIG_OPTIONS } from "../entities/config"
import * as streamifier from "streamifier"

export type CloudinaryType = UploadApiErrorResponse | UploadApiResponse

@Injectable()
export class CloudinaryStrategy implements IFileSystemService, IFileoptionsConfigurator {
  constructor(
    @Inject(CONFIG_OPTIONS)
    protected fs: FileSystemModuleOptions
  ) {
    cloudinary.config({
      cloud_name: fs.clients.cloudinary.cloudName,
      api_key: fs.clients.cloudinary.apiKey,
      api_secret: fs.clients.cloudinary.apiSecret
    })
  }

  setOptions(options: CloudinaryStorageOptions): IFileSystemService {
    cloudinary.config({
      cloud_name: options.cloudName,
      api_key: options.apiKey,
      api_secret: options.apiSecret
    })

    return this
  }

  async upload(file: FileUploadDto): Promise<string> {
    try {
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
          if (error) return reject(error)
          resolve(result.secure_url)
        })
        streamifier.createReadStream(file.buffer).pipe(uploadStream)
      })
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
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
    } catch (error) {
      throw new ApiException(`Failed to delete file from Cloudinary: ${error.message}`, 500)
    }
  }
}
