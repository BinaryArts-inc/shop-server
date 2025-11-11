import * as fs from "fs"
import * as path from "path"
import * as mime from "mime-types"
import archiver from "archiver"
import { WritableStreamBuffer } from "stream-buffers"
import { Inject, Injectable } from "@nestjs/common"

import { FileSystemModuleOptions, LocalFsOptions } from "../interfaces/config.interface"
import { FileMetada, FileUploadDto, IFileSystemService } from "../interfaces/filesystem.interface"
import { CONFIG_OPTIONS } from "../entities/config"
import { ApiException } from "@/exceptions/api.exception"

@Injectable()
export class LocalFsStrategy implements IFileSystemService {
  private config: LocalFsOptions

  constructor(@Inject(CONFIG_OPTIONS) protected fsOptions: FileSystemModuleOptions) {
    this.config = fsOptions.clients.local
  }

  async upload(file: FileUploadDto): Promise<string> {
    const error = this.checkConfig(this.config)
    if (error) throw new ApiException(error, 500)

    if (!file.filePath) {
      throw new Error("File path is required in FileUploadDto")
    }

    const destinationPath = path.join(this.config.root, file.destination)

    const dirPath = path.dirname(destinationPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    await fs.promises.copyFile(file.filePath, destinationPath)

    const fileUrl = `${this.config.baseUrl}/${path.relative(this.config.root, destinationPath).replace(/\\/g, "/")}`

    return fileUrl
  }

  async get(path: string): Promise<Buffer> {
    const error = this.checkConfig(this.config)
    if (error) throw new ApiException(error, 500)

    const filePath = this.getFullPath(path)
    return fs.promises.readFile(filePath)
  }

  async getMetaData(path: string): Promise<FileMetada> {
    const error = this.checkConfig(this.config)
    if (error) throw new ApiException(error, 500)

    const fullPath = this.getFullPath(path)

    if (!fs.existsSync(fullPath)) {
      throw new ApiException(`File not found at path: ${fullPath}`, 404)
    }

    const stats = await fs.promises.stat(fullPath)

    return {
      name: path.split("/").pop() || path,
      size: stats.size,
      mimeType: mime.lookup(fullPath) || "application/octet-stream",
      url: `${this.config.baseUrl}/${path.replace(/\\/g, "/")}`,
      lastModified: stats.birthtime
    }
  }

  async zipFolder(folderPath: string): Promise<Buffer> {
    const error = this.checkConfig(this.config)
    if (error) throw new ApiException(error, 500)

    const fullFolderPath = this.getFullPath(folderPath)

    if (!fs.existsSync(fullFolderPath)) {
      throw new ApiException(`Folder not found at path: ${fullFolderPath}`, 404)
    }

    const output = new WritableStreamBuffer({
      initialSize: 1000 * 1024,
      incrementAmount: 1000 * 1024
    })

    const archive = archiver("zip", { zlib: { level: 9 } })

    return new Promise<Buffer>((resolve, reject) => {
      archive.pipe(output)

      archive.on("error", (err) => {
        console.error("Archiver error:", err)
        reject(new ApiException("Failed to create zip", 500))
      })

      output.on("finish", () => {
        const buffer = output.getContents()
        if (!buffer) return reject(new ApiException("Zip buffer is empty", 500))
        resolve(buffer)
      })

      output.on("error", (err) => {
        console.error("Output error:", err)
        reject(new ApiException("Failed to write zip", 500))
      })

      const addFilesRecursively = (dir: string, base: string) => {
        const items = fs.readdirSync(dir)
        for (const item of items) {
          const fullPath = path.join(dir, item)
          const relativePath = path.relative(base, fullPath)
          const stats = fs.statSync(fullPath)
          if (stats.isDirectory()) {
            addFilesRecursively(fullPath, base)
          } else {
            archive.file(fullPath, { name: relativePath })
          }
        }
      }

      addFilesRecursively(fullFolderPath, fullFolderPath)

      archive.finalize()
    })
  }

  async update(path: string, file: FileUploadDto): Promise<string> {
    const error = this.checkConfig(this.config)
    if (error) throw new ApiException(error, 500)

    await this.delete(path)
    return this.upload(file)
  }

  async delete(path: string): Promise<void> {
    const error = this.checkConfig(this.config)
    if (error) throw new ApiException(error, 500)

    const filePath = this.getFullPath(path)
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
    }
  }

  private getFullPath(relativePath: string): string {
    return path.join(this.config.root, relativePath)
  }

  private checkConfig(options: LocalFsOptions): string {
    if (!options.driver) return "Invalid driver for Local Storage"
    if (!options.baseUrl) return "No Base Url Provided for Local Storage"
    if (!options.root) return "No root path provided for Local Storage"
    return ""
  }
}
