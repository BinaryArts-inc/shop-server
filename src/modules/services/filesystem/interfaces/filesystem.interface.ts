import { FIleSystemDriverOption } from "./config.interface"

export interface IFileSystemService {
  upload(file: FileUploadDto): Promise<string>
  get(path: string): Promise<Buffer>
  update(path: string, file: FileUploadDto): Promise<string>
  delete(path: string): Promise<void>
}

export interface IFileoptionsConfigurator {
  setOptions(options: FIleSystemDriverOption): IFileSystemService
}

export interface FileUploadDto {
  buffer?: Buffer
  filePath?: string
  mimetype: string
  destination: string
}
