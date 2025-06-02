import * as path from "path"
import { ConfigModule, ConfigService, registerAs } from "@nestjs/config"
import { FileSystemModuleAsynOptions, FileSystemModuleOptions } from "src/modules/services/filesystem/interfaces/config.interface"

function getOptions(): FileSystemModuleOptions {
  return {
    default: "spaces",
    clients: {
      local: {
        driver: "local",
        root: path.join(__dirname, "../../uploads"),
        baseUrl: ""
      },
      s3: {
        driver: "s3",
        key: process.env.DO_SPACE_KEY,
        secret: process.env.DO_SPACE_SECRET,
        bucket: process.env.BUCKET_NAME,
        region: process.env.DO_SPACES_REGION,
        endpoint: process.env.DO_S3_ENDPOINT
      },
      google: {
        driver: "google",
        bucket: "",
        keyFilename: "",
        projectId: "google-sheets",
        publicUrl: ""
      },
      spaces: {
        driver: "spaces",
        bucket: process.env.BUCKET_NAME,
        region: process.env.DO_SPACES_REGION,
        secret: process.env.DO_SPACE_SECRET,
        key: process.env.DO_SPACE_KEY,
        endpoint: process.env.DO_SPACE_ENDPOINT
      },
      cloudinary: {
        driver: "cloudinary",
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      }
    }
  }
}

export default registerAs("filesystems", getOptions)

export const fileConfigAsync: FileSystemModuleAsynOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get<FileSystemModuleOptions>("filesystems")
    return config
  },
  inject: [ConfigService]
}
