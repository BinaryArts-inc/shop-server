import { HttpException, Inject, Injectable } from "@nestjs/common"

import { CONFIG_OPTIONS } from "./entities/config"
import { FileMetada, FileUploadDto, IFileSystemService } from "./interfaces/filesystem.interface"
import { FileSystemDefault, FileSystemDriver, FileSystemModuleOptions, IFileSystemClients } from "./interfaces/config.interface"

import { FILESYSTEM_STRATEGY } from "./entities/strategies"

import { S3Strategy } from "./strategies/aws.strategy"
import { LocalFsStrategy } from "./strategies/local.strategy"
import { CloudinaryStrategy } from "./strategies/cloudinary.service"
import { GoogleStorageStrategy } from "./strategies/google.strategy"
import { DigitalOceanStrategy } from "./strategies/digitalocean.strategy"

@Injectable()
export class FileSystemService implements IFileSystemService {
  // Default filesystem client
  private default: FileSystemDefault

  // All configured filesystem clients
  private clients: IFileSystemClients

  // Maps each driver to its corresponding service implementation
  private strategyMap: Record<FileSystemDriver, IFileSystemService>

  constructor(
    @Inject(CONFIG_OPTIONS)
    protected options: FileSystemModuleOptions,

    @Inject(FILESYSTEM_STRATEGY.aws)
    private readonly s3: S3Strategy,

    @Inject(FILESYSTEM_STRATEGY.digitalOcean)
    private readonly spaces: DigitalOceanStrategy,

    @Inject(FILESYSTEM_STRATEGY.google)
    private readonly google: GoogleStorageStrategy,

    @Inject(FILESYSTEM_STRATEGY.cloudinary)
    private readonly cloudinary: CloudinaryStrategy,

    @Inject(FILESYSTEM_STRATEGY.local)
    private readonly local: LocalFsStrategy
  ) {
    if (!options.default || !options.clients[options.default]) {
      throw new HttpException(`Invalid default filesystem: ${options.default}`, 500)
    }

    this.default = options.default
    this.clients = options.clients
    this.strategyMap = {
      s3: this.s3,
      google: this.google,
      local: this.local,
      cloudinary: this.cloudinary,
      spaces: this.spaces
    }
  }

  // --- Public API Methods ---
  // Each method delegates to the default filesystem strategy
  async upload(file: FileUploadDto): Promise<string> {
    const service = this.getDefaultService()
    return service.upload(file)
  }

  async get(path: string): Promise<Buffer> {
    const service = this.getDefaultService()
    return service.get(path)
  }

  async getMetaData(path: string): Promise<FileMetada> {
    const service = this.getDefaultService()
    return service.getMetaData(path)
  }

  async zipFolder(folderPath: string): Promise<Buffer> {
    const service = this.getDefaultService()
    return service.zipFolder(folderPath)
  }

  async update(path: string, file: FileUploadDto): Promise<string> {
    const service = this.getDefaultService()
    return service.update(path, file)
  }

  async delete(path: string): Promise<void> {
    const service = this.getDefaultService()
    return service.delete(path)
  }

  // --- Strategy Resolver ---
  getFileSystem(driver: FileSystemDriver): IFileSystemService {
    const options = this.clients[driver]

    if (!options) {
      throw new HttpException(`FileSystem ${driver} not configured`, 500)
    }

    const strategy = this.strategyMap[driver]
    if (!strategy) throw new HttpException(`Invalid filesystem`, 500)

    return strategy
  }

  // --- Default Strategy Helper ---
  private getDefaultService() {
    const options = this.clients[this.default]
    if (!options) throw new HttpException(`Invalid default filesystem: ${this.default}`, 500)
    return this.getFileSystem(options.driver)
  }
}
