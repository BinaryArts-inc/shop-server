// Base service contract — every driver strategy must implement this
export interface IFileSystemService {
  upload(file: FileUploadDto): Promise<string> // return file URL or identifier
  get(path: string): Promise<Buffer> // download file as buffer
  getMetaData(path: string): Promise<FileMetada>
  zipFolder(folderPath: string): Promise<Buffer>
  update(path: string, file: FileUploadDto): Promise<string>
  delete(path: string): Promise<void>
}

// DTO for uploads, flexible enough for local (filePath) or remote (buffer) sources
export interface FileUploadDto {
  buffer?: Buffer
  filePath?: string // for local uploads
  mimetype: string
  destination: string // folder or bucket
}

export interface FileMetada {
  name: string
  size: number
  url: string
  mimeType: string
  lastModified: Date
}
