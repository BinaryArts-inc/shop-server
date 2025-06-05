import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from "@nestjs/common"
import { StoreService } from "./store.service"
import { CreateStoreDto, storeSchema } from "./dto/create-store.dto"
import { UpdateStoreDto } from "./dto/update-store.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskUpload } from "@/config/multer.config"
import { FileUploadDto } from "./dto/fileUploadDto"
import JwtShortTimeGuard from "../auth/guard/jwt-short-time.guard"
import { FileSystemService } from "../services/filesystem/filesystem.service"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { UserId } from "../user/decorator/user.decorator"
import { Short_Time } from "../auth/decorators/short-time.decorator"
import { UserService } from "../user/user.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { ConflictException } from "@/exceptions/conflict.exception"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"

@Controller("store")
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private fileSystemService: FileSystemService,
    private userService: UserService,
    private helperService: HelpersService,
    private configService: ConfigService
  ) {}

  @Short_Time()
  @Post()
  @UseGuards(JwtShortTimeGuard)
  @UseInterceptors(FileInterceptor("image", { ...diskUpload }))
  async create(
    @Body(new JoiValidationPipe(storeSchema)) createStoreDto: CreateStoreDto,
    @UploadedFile() fileUploaded: CustomFile,
    @UserId() userId: string
  ) {
    const fileDto: FileUploadDto = {
      destination: `images/${fileUploaded.originalname}-storelogo.${fileUploaded.extension}`,
      mimetype: fileUploaded.mimetype,
      buffer: fileUploaded.buffer,
      filePath: fileUploaded.path
    }

    const url = await this.fileSystemService.upload(fileDto)
    createStoreDto = {
      ...createStoreDto,
      logo: url
    }

    const business = await this.userService.getUserBusiness({ user: { id: userId } })
    if (!business) throw new NotFoundException("Business does not exist")

    if (await this.storeService.exist({ name: createStoreDto.name })) throw new ConflictException("Store name already exist")

    this.storeService.create(createStoreDto, business)
    const payload = { email: business.user.email, id: business.user.id }
    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
    return { token }
  }

  @Get()
  findAll() {
    return this.storeService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.storeService.findOne({ id: id })
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.update(+id, updateStoreDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.storeService.remove(+id)
  }
}
