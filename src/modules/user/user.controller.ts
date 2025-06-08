import { Controller } from "@nestjs/common"
import { UserService } from "./user.service"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { ConfigService } from "@nestjs/config"

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private helperServices: HelpersService,
    private configService: ConfigService
  ) {}
}
