import { Controller, Post, Body, HttpCode, Patch, UseGuards, Req } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { AuthDto, registerSchema, ResendOtpDto, resendOtpSchema, verifyEmailDto, verifyEmailSchema } from "./dto/auth.dto"
import { Public } from "./decorators/public.decorator"
import JwtShortTimeGuard from "./guard/jwt-short-time.guard"
import { AuthGuard } from "@nestjs/passport"
import { Request } from "express"
import { PasswordAuthGuard } from "./guard/passport-auth.guard"
import { LoginValidationGuard } from "./guard/login-validation.guard"
import { Short_Time } from "./decorators/short-time.decorator"

@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  @HttpCode(201)
  async register(@Body(new JoiValidationPipe(registerSchema)) registerDto: AuthDto) {
    return await this.authService.register(registerDto)
  }

  @Post("/login/password")
  @HttpCode(200)
  @UseGuards(LoginValidationGuard, PasswordAuthGuard)
  async login(@Req() req: Request) {
    const tokens = await this.authService.login({ email: req.user.email, id: req.user.id })
    return { ...req.user, tokens }
  }

  @Short_Time()
  @Post("/verifyemail")
  @HttpCode(200)
  @UseGuards(JwtShortTimeGuard)
  async verifyEmail(@Body(new JoiValidationPipe(verifyEmailSchema)) verifyEmailDto: verifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto.code)
  }

  @Patch("/resendotp")
  async resendOtp(@Body(new JoiValidationPipe(resendOtpSchema)) otpDto: ResendOtpDto) {
    return this.authService.resendOtp(otpDto.email)
  }
}
