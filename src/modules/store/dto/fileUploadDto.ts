export interface FileUploadDto {
  buffer?: Buffer
  filePath?: string
  mimetype: string
  destination: string
}
