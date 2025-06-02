import { Injectable } from '@nestjs/common'
import { FileUploadDto, IFileoptionsConfigurator, IFileSystemService } from './interfaces/filesystem.interface'
import { LocalFsOptions } from './interfaces/config.interface'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class LocalFsService implements IFileSystemService, IFileoptionsConfigurator {
   private root: string
   private baseUrl: string

   async upload(file: FileUploadDto): Promise<string> {
      if (!file.filePath) {
         throw new Error('File path is required in FileUploadDto')
      }

      const destinationPath = path.join(this.root, file.destination)

      const dirPath = path.dirname(destinationPath)
      if (!fs.existsSync(dirPath)) {
         fs.mkdirSync(dirPath, { recursive: true })
      }

      await fs.promises.copyFile(file.filePath, destinationPath)

      const fileUrl = `${this.baseUrl}/${path.relative(this.root, destinationPath).replace(/\\/g, '/')}`

      return fileUrl
   }

   async get(path: string): Promise<Buffer> {
      const filePath = this.getFullPath(path)
      return fs.promises.readFile(filePath)
   }

   async update(path: string, file: FileUploadDto): Promise<string> {
      await this.delete(path)
      return this.upload(file)
   }

   async delete(path: string): Promise<void> {
      const filePath = this.getFullPath(path)
      if (fs.existsSync(filePath)) {
         await fs.promises.unlink(filePath)
      }
   }

   setOptions(options: LocalFsOptions): IFileSystemService {
      if (!options.root) {
         throw new Error(`Local filesystem root path not set`)
      }

      this.root = options.root
      this.baseUrl = options.baseUrl || ''

      if (!fs.existsSync(this.root)) {
         fs.mkdirSync(this.root, { recursive: true })
      }
      return this
   }

   private getFullPath(relativePath: string): string {
      return path.join(this.root, relativePath)
   }
}
