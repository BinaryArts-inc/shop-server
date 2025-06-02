import * as fs from "fs"
import handlebars from "handlebars"
import puppeteer, { PDFOptions } from "puppeteer"
import { Inject, Injectable } from "@nestjs/common"

import { S3Service } from "./aws.service"
import { LocalFsService } from "./local.service"
import { GoogleStorageService } from "./google.service"
import { DigitalOceanService } from "./digitalocean.service"

import { CONFIG_OPTIONS } from "./entities/config"
import { FileUploadDto, IFileSystemService } from "./interfaces/filesystem.interface"
import { FileSystemDefault, FileSystemDriver, FileSystemModuleOptions, IFileSystemClients } from "./interfaces/config.interface"
import { ApiException } from "@/exceptions/api.exception"
import { CloudinaryService } from "./cloudinary.service"

@Injectable()
export class FileSystemService implements IFileSystemService {
  private default: FileSystemDefault
  private clients: IFileSystemClients

  private awsService: S3Service
  private localFsService: LocalFsService
  private googleService: GoogleStorageService
  private digitalOceanService: DigitalOceanService
  private cloudinaryService: CloudinaryService

  constructor(@Inject(CONFIG_OPTIONS) protected options: FileSystemModuleOptions) {
    if (!options.default || !options.clients[options.default]) {
      throw new ApiException(`Invalid default filesystem: ${options.default}`, 500)
    }

    this.default = options.default
    this.clients = options.clients

    this.localFsService = new LocalFsService()
    this.digitalOceanService = new DigitalOceanService()
    this.awsService = new S3Service()
    this.googleService = new GoogleStorageService()
    this.cloudinaryService = new CloudinaryService()
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

    switch (driver) {
      case "local":
        return this.localFsService.setOptions(this.clients[driver])
      case "spaces":
        return this.digitalOceanService.setOptions(this.clients[driver])
      case "s3":
        return this.awsService.setOptions(this.clients[driver])
      case "google":
        return this.googleService.setOptions(this.clients[driver])
      case "cloudinary":
        return this.cloudinaryService.setOptions(this.clients[driver])
      default:
        throw new ApiException(`Invalid filesystem`, 500)
    }
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
