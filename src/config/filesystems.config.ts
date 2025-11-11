import * as path from "path"
import { ConfigModule, ConfigService, registerAs } from "@nestjs/config"
import { FileSystemDriver, FileSystemModuleAsynOptions, FileSystemModuleOptions } from "@modules/services/filesystem/interfaces/config.interface"

function getOptions(): FileSystemModuleOptions {
  return {
    default: (process.env.DEFAULT_FILESYSTEM || "local") as FileSystemDriver,
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
        region: process.env.DO_SPACES_REGION
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
        key: process.env.DO_SPACE_KEY
      },
      cloudinary: {
        driver: "cloudinary",
        cloudName: process.env.CLOUDINARY_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
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
