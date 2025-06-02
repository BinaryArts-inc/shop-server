import { ModuleMetadata } from "@nestjs/common"

export interface FileSystemModuleOptions {
  clients: IFileSystemClients
  default: FileSystemDefault
}

export type IFileSystemClients = {
  local: LocalFsOptions
  s3: S3Options
  spaces: DOSpacesOptions
  google: GoogleStorageOptions
  cloudinary: CloudinaryStorageOptions
}

export type LocalFsOptions = {
  driver: "local"
  root: string
  baseUrl: string
}

export type S3Options = {
  driver: "s3"
  key: string
  bucket: string
  region: string
  secret: string
  endpoint?: string
}

export type DOSpacesOptions = {
  driver: "spaces"
  key: string
  secret: string
  bucket: string
  region: string
  endpoint: string
}

export type GoogleStorageOptions = {
  driver: "google"
  bucket: string
  keyFilename: string
  projectId: string
  publicUrl?: string
}

export type CloudinaryStorageOptions = {
   driver: 'cloudinary'
  cloud_name: string
  api_key: string
  api_secret: string
}

export type FileSystemDriver = "local" | "s3" | "google" | "spaces" | "cloudinary"

export type FIleSystemDriverOption = LocalFsOptions | DOSpacesOptions | GoogleStorageOptions | S3Options | CloudinaryStorageOptions

export type FileSystemDefault = keyof IFileSystemClients

export interface FileSystemModuleAsynOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (...args: any[]) => Promise<FileSystemModuleOptions> | FileSystemModuleOptions
  inject?: any[]
}
