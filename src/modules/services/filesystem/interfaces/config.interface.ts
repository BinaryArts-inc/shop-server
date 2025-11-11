import { ModuleMetadata } from "@nestjs/common"

// Top-level options that the FilesystemModule will consume
export interface FileSystemModuleOptions {
  clients: IFileSystemClients // map of configured storage clients
  default: FileSystemDefault // the default storage driver key
}

// Shape of all supported storage clients
export type IFileSystemClients = {
  local: LocalFsOptions
  s3: S3Options
  spaces: DOSpacesOptions
  google: GoogleStorageOptions
  cloudinary: CloudinaryStorageOptions
}

// --- Individual driver option contracts ---

export type LocalFsOptions = {
  driver: "local"
  root: string // absolute path to local storage root
  baseUrl: string // base URL for serving local files
}

export type S3Options = {
  driver: "s3"
  key: string
  bucket: string
  region: string
  secret: string
}

export type DOSpacesOptions = {
  driver: "spaces"
  key: string
  secret: string
  bucket: string
  region: string
}

export type GoogleStorageOptions = {
  driver: "google"
  bucket: string
  keyFilename: string // path to service account key
  projectId: string
  publicUrl?: string // optional: override public base URL
}

export type CloudinaryStorageOptions = {
  driver: "cloudinary"
  cloudName: string
  apiKey: string
  apiSecret: string
}

// Union of all possible driver names
export type FileSystemDriver = "local" | "s3" | "google" | "spaces" | "cloudinary"

// Union of all possible driver config objects
export type FIleSystemDriverOption = LocalFsOptions | DOSpacesOptions | GoogleStorageOptions | S3Options | CloudinaryStorageOptions

// Default client must be one of the defined keys
export type FileSystemDefault = keyof IFileSystemClients

// Async module registration options
export interface FileSystemModuleAsynOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (...args: any[]) => Promise<FileSystemModuleOptions> | FileSystemModuleOptions
  inject?: any[]
}
