import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common"
import { UserService } from "./user.service"
import JwtShortTimeGuard from "../auth/guard/jwt-short-time.guard"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { CreateUserBusinessDto, createUserBusinessSchema } from "./dto/business.dto"
import { Request } from "express"

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtShortTimeGuard)
  @Patch("/business")
  async createBusiness(@Body(new JoiValidationPipe(createUserBusinessSchema)) userBusinessDto: CreateUserBusinessDto, @Req() req: Request) {
    const userId = req.payload.id
    return await this.userService.createUserBusiness(userBusinessDto, userId)
  }
}
