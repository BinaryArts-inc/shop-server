import * as fs from "fs"
import * as path from "path"
import { Request } from "express"
import { HttpStatus } from "@nestjs/common"
import { diskStorage, memoryStorage } from "multer"
import { MulterModuleAsyncOptions } from "@nestjs/platform-express"
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"
import { ApiException } from "@/exceptions/api.exception"

const dest = "./uploads"

function isAudioFile(extname: string) {
  const audioExtensions = [".mp3", ".ogg", ".wav", ".wmv"]
  return audioExtensions.includes(extname.toLowerCase())
}

function isVideoFile(extname: string) {
  const videoExtensions = [".mp4", ".avi", ".webm", ".mov", ".wmv"]
  return videoExtensions.includes(extname.toLowerCase())
}

export function imageFilter(_req: Request, file: CustomFile, callback: any) {
  const ext = path.extname(file.originalname).replace(".", "")

  if (ext !== "png" && ext !== "jpg" && ext !== "gif" && ext !== "jpeg") {
    return callback(new ApiException("Only images are allowed", HttpStatus.UNSUPPORTED_MEDIA_TYPE), false)
  }

  const name = file.originalname.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()

  file.originalname = name

  file.extension = ext

  callback(null, true)
}

export function pdfFilter(_req: Request, file: CustomFile, callback: any) {
  const ext = path.extname(file.originalname)

  if (ext !== ".pdf") {
    return callback(new ApiException("Only PDF files are allowed", HttpStatus.UNSUPPORTED_MEDIA_TYPE), false)
  }

  const name = file.originalname.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()

  file.originalname = name

  file.extension = ext

  callback(null, true)
}

const myMemoryStorage = memoryStorage()

const myDiskStorage = diskStorage({
  destination: dest,

  filename: async (req: Request, file: CustomFile, cb) => {
    const extname = path.extname(file.originalname)
    const basename = path.basename(file.originalname, extname)

    let filename = basename + extname
    let i = 1
    while (fs.existsSync(`${dest}/${filename}`)) {
      filename = `${basename}(${i++})${extname}`
    }

    // Set the 'extension' field based on the file extension
    if (isAudioFile(extname)) {
      file.extension = "audio"
    } else if (isVideoFile(extname)) {
      file.extension = "video"
    } else {
      file.extension = "document"
    }

    cb(null, filename)
  }
})

export const diskUpload: MulterOptions = {
  storage: myDiskStorage,
  limits: {
    fileSize: 15485760
  }
}

export const memoryUpload: MulterOptions = {
  storage: myMemoryStorage,
  limits: {
    fileSize: 2000000
  }
}

export const multerConfigAsync: MulterModuleAsyncOptions = {
  useFactory: () => ({
    dest
  })
}

export function createStudentFilesFilter(_req: Request, file: CustomFile, callback: any) {
  const ext = path.extname(file.originalname).replace(".", "")

  if (file.fieldname === "photos" && !["png", "jpg", "gif", "jpeg"].includes(ext)) {
    return callback(new ApiException("Only images are allowed in the photo field", HttpStatus.UNSUPPORTED_MEDIA_TYPE), false)
  }

  if (file.fieldname === "receipts" && ext !== "pdf") {
    return callback(new ApiException("Only PDF files are allowed in the receipts field", HttpStatus.UNSUPPORTED_MEDIA_TYPE), false)
  }

  const name = file.originalname.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()

  file.originalname = name
  file.extension = ext

  callback(null, true)
}
