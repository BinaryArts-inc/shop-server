import { Body, Controller, Patch, Req, UseGuards } from "@nestjs/common"
import { UserService } from "./user.service"
import JwtShortTimeGuard from "../auth/guard/jwt-short-time.guard"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { CreateUserBusinessDto, createUserBusinessSchema } from "./dto/business.dto"
import { Request } from "express"
import { Short_Time } from "../auth/decorators/short-time.decorator"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { ConflictException } from "@/exceptions/conflict.exception"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private helperServices: HelpersService,
    private configService: ConfigService
  ) {}

  @Short_Time()
  @UseGuards(JwtShortTimeGuard)
  @Patch("/business")
  async createBusiness(@Body(new JoiValidationPipe(createUserBusinessSchema)) userBusinessDto: CreateUserBusinessDto, @Req() req: Request) {
    const userId = req.payload.id
    const user = await this.userService.findOne({ id: userId })
    if (!user) throw new NotFoundException("User does not exist")
    const business = await this.userService.findOneBusiness({ user: { id: user.id } })
    if (business) throw new ConflictException("User already created a business")
    await this.userService.createUserBusiness(userBusinessDto, user)
    const payload = { email: user.email, id: user.id }
    const token = await this.helperServices.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
    return { token }
  }
}
