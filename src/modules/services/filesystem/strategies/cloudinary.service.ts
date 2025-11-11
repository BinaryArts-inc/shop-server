import * as fs from "fs"
import axios from "axios"
import archiver from "archiver"
import { Readable } from "stream"
import { HttpException, Inject, Injectable } from "@nestjs/common"
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary"

import { CONFIG_OPTIONS } from "../entities/config"
import { WritableStreamBuffer } from "stream-buffers"
import { FileSystemModuleOptions } from "../interfaces/config.interface"
import { FileMetada, FileUploadDto, IFileSystemService } from "../interfaces/filesystem.interface"

export type CloudinaryType = UploadApiErrorResponse | UploadApiResponse

@Injectable()
export class CloudinaryStrategy implements IFileSystemService {
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
      throw new HttpException(`Failed to upload file to Cloudinary: ${error.message}`, 500)
    }
  }

  async get(publicId: string): Promise<any> {
    // Cloudinary does not provide direct file download via SDK
    return cloudinary.url(publicId)
  }

  async getMetaData(path: string): Promise<FileMetada> {
    const result = await cloudinary.api.resource(path, {
      resource_type: "auto"
    })

    return {
      name: result.original_filename,
      size: result.bytes,
      mimeType: result.resource_type + "/" + result.format,
      url: result.secure_url,
      lastModified: new Date(result.created_at)
    }
  }

  async zipFolder(folderPath: string): Promise<Buffer> {
    try {
      const resources = await cloudinary.api.resources({
        prefix: folderPath,
        type: "upload",
        resource_type: "auto",
        max_results: 100
      })

      if (!resources.resources.length) {
        throw new HttpException(`No files found in ${folderPath}`, 404)
      }

      const output = new WritableStreamBuffer()

      const archive = archiver("zip", { zlib: { level: 9 } })
      archive.pipe(output)

      for (const file of resources.resources) {
        const response = await axios.get(file.secure_url, { responseType: "stream" })
        const stream = response.data as Readable
        const name = file.public_id.replace(folderPath + "/", "")
        archive.append(stream, { name: `${name}.${file.format}` })
      }

      archive.finalize()

      const content = output.getContents()

      if (!content) {
        throw new HttpException("internal server error", 500)
      }

      return content
    } catch (error) {
      throw new HttpException(`Failed to zip folder: ${error.message}`, 500)
    }
  }

  async update(publicId: string, file: FileUploadDto): Promise<string> {
    await this.delete(publicId)
    return this.upload(file)
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
    } catch (error) {
      throw new HttpException(`Failed to delete file from Cloudinary: ${error.message}`, 500)
    }
  }
}
