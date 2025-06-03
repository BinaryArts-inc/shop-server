import * as fs from "fs"
import handlebars from "handlebars"
import puppeteer, { PDFOptions } from "puppeteer"
import { Inject, Injectable } from "@nestjs/common"

import { CONFIG_OPTIONS } from "./entities/config"
import { FileUploadDto, IFileoptionsConfigurator, IFileSystemService } from "./interfaces/filesystem.interface"
import { FileSystemDefault, FileSystemDriver, FileSystemModuleOptions, IFileSystemClients } from "./interfaces/config.interface"

import { ApiException } from "@/exceptions/api.exception"
import { FILESYSTEM_STRATEGY } from "./entities/strategies"

import { S3Strategy } from "./strategies/aws.strategy"
import { LocalFsStrategy } from "./strategies/local.strategy"
import { CloudinaryStrategy } from "./strategies/cloudinary.service"
import { GoogleStorageStrategy } from "./strategies/google.strategy"
import { DigitalOceanStrategy } from "./strategies/digitalocean.strategy"

@Injectable()
export class FileSystemService implements IFileSystemService {
  private default: FileSystemDefault
  private clients: IFileSystemClients

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
      throw new ApiException(`Invalid default filesystem: ${options.default}`, 500)
    }

    this.default = options.default
    this.clients = options.clients
  }

  private strategyMap: Record<FileSystemDriver, IFileSystemService & IFileoptionsConfigurator> = {
    s3: this.s3,
    google: this.google,
    local: this.local,
    cloudinary: this.cloudinary,
    spaces: this.spaces
  }

  async upload(file: FileUploadDto): Promise<string> {
    const options = this.clients[this.default]
    const service = this.getFileSystem(options.driver)
    return service.upload(file)
  }

  async get(path: string): Promise<Buffer> {
    const options = this.clients[this.default]
    const service = this.getFileSystem(options.driver)
    return service.get(path)
  }

  async update(path: string, file: FileUploadDto): Promise<string> {
    const options = this.clients[this.default]
    const service = this.getFileSystem(options.driver)
    return service.update(path, file)
  }

  async delete(path: string): Promise<void> {
    const options = this.clients[this.default]
    const service = this.getFileSystem(options.driver)
    return service.delete(path)
  }

  getFileSystem(driver: FileSystemDriver): IFileSystemService {
    const options = this.clients[driver]

    if (!options) {
      throw new ApiException(`FileSystem ${driver} not configured`, 500)
    }

    const strategy = this.strategyMap[driver]
    if (!strategy) throw new ApiException(`Invalid filesystem`, 500)

    return strategy.setOptions(this.clients[driver])
  }

  async generatePDF(path: string, data: Record<string, any>, options: PDFOptions) {
    const templateHtml = fs.readFileSync(path, "utf8")

    const template = handlebars.compile(templateHtml)

    const html = template(data) //will need this when it's dynamice
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disabled-setupid-sandbox"]
    })

    const page = await browser.newPage()
    await page.addStyleTag({
      content: `
      table {
        page-break-inside: avoid;
        page-break-before: always;
      }
    `
    })

    await page.goto(`data:text/html;charset=UTF-8,${html}`, {
      waitUntil: "networkidle0"
    })

    await page.pdf(options)
    await browser.close()
  }
}
