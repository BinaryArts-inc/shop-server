import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common"
import { UserService } from "./user.service"
import { UpdateUserDto, updateUserSchema } from "./dto/update-user-dto"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { IUserQuery } from "./interfaces/users-query.interface"
import { UserInterceptor } from "./interceptor/user.interceptor"
import { UsersInterceptor } from "./interceptor/users.interceptor"
import { User } from "./entity/user.entity"
import { Action } from "../services/casl/actions/action"
import { PolicyUsersGuard } from "./guard/policy-user.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Response } from "express"
import { CsvService } from "../services/utils/csv/csv.service"
import { FileInterceptor } from "@nestjs/platform-express"
import { imageFilter, memoryUpload } from "@/config/multer.config"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { FileSystemService } from "../services/filesystem/filesystem.service"

@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private fileSystemService: FileSystemService,
    private readonly csvService: CsvService
  ) {}

  @UseGuards(PolicyUsersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User))
  @UseInterceptors(FileInterceptor("image", { ...memoryUpload, fileFilter: imageFilter }), UserInterceptor)
  @Patch("/:id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new JoiValidationPipe(updateUserSchema)) updateUser: UpdateUserDto,
    @UploadedFile() fileUploaded: CustomFile
  ) {
    const user = await this.userService.findById(id)
    if (!user) {
      throw new NotFoundException("User does not exist")
    }

    let url: string
    if (fileUploaded) {
      const fileDto: FileUploadDto = {
        destination: `images/${fileUploaded.originalname}-userlogo.${fileUploaded.extension}`,
        mimetype: fileUploaded.mimetype,
        buffer: fileUploaded.buffer,
        filePath: fileUploaded.path
      }
      url = await this.fileSystemService.upload(fileDto)
    }

    updateUser = { ...updateUser, profileImage: url ?? user.profileImage }

    if (fileUploaded && user.profileImage?.trim()) {
      await this.fileSystemService.delete(user.profileImage)
    }

    return await this.userService.update(user, updateUser)
  }

  @UseGuards(PolicyUsersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, User))
  @UseInterceptors(UsersInterceptor)
  @Get()
  async findAll(@Query() query: IUserQuery) {
    return await this.userService.find(query)
  }

  @UseGuards(PolicyUsersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, User))
  @Get("download")
  async download(@Query() query: IUserQuery, @Res() res: Response) {
    const [users] = await this.userService.find(query)

    const { headers, records } = await this.userService.headersRecords(query, users)

    const data = await this.csvService.writeCsvToBuffer({ headers, records })

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=users.csv")
    res.send(data)
  }

  @UseGuards(PolicyUsersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, User))
  @UseInterceptors(UserInterceptor)
  @Get("/:id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.userService.findOne({ id })
  }

  @UseGuards(PolicyUsersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, User))
  @Delete("/:id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return await this.userService.remove({ id })
  }
}
