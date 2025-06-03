import { Controller, Post, Body, HttpCode, Patch, UseGuards, Req, UseInterceptors } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { AuthDto, registerSchema, ResendOtpDto, resendOtpSchema, VerifyEmailDto, verifyEmailSchema } from "./dto/auth.dto"
import { Public } from "./decorators/public.decorator"
import JwtShortTimeGuard from "./guard/jwt-short-time.guard"
import { Request } from "express"
import { PasswordAuthGuard } from "./guard/passport-auth.guard"
import { LoginValidationGuard } from "./guard/login-validation.guard"
import { Short_Time } from "./decorators/short-time.decorator"
import { AuthInterceptor } from "./interceptors/auth.interceptor"

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
  @UseInterceptors(AuthInterceptor)
  @UseGuards(LoginValidationGuard, PasswordAuthGuard)
  async login(@Req() req: Request) {
    return await this.authService.login({ email: req.user.email, id: req.user.id }, req.user)
  }

  @Short_Time()
  @Post("/verifyemail")
  @HttpCode(200)
  @UseGuards(JwtShortTimeGuard)
  async verifyEmail(@Body(new JoiValidationPipe(verifyEmailSchema)) verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto.code)
  }

  @Patch("/resendotp")
  async resendOtp(@Body(new JoiValidationPipe(resendOtpSchema)) otpDto: ResendOtpDto) {
    return this.authService.resendOtp(otpDto.email)
  }
}
