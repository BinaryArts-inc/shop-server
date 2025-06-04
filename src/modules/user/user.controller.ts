import { Body, Controller, Patch, Req, UseGuards } from "@nestjs/common"
import { UserService } from "./user.service"
import JwtShortTimeGuard from "../auth/guard/jwt-short-time.guard"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { CreateUserBusinessDto, createUserBusinessSchema } from "./dto/business.dto"
import { Request } from "express"
import { Short_Time } from "../auth/decorators/short-time.decorator"

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Short_Time()
  @UseGuards(JwtShortTimeGuard)
  @Patch("/business")
  async createBusiness(@Body(new JoiValidationPipe(createUserBusinessSchema)) userBusinessDto: CreateUserBusinessDto, @Req() req: Request) {
    const userId = req.payload.id
    return await this.userService.createUserBusiness(userBusinessDto, userId)
  }
}
