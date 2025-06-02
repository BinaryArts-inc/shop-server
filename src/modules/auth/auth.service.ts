import { Injectable } from "@nestjs/common"
import { UserService } from "../user/user.service"
import { AuthDto, LoginAuthDto, LoginDto } from "./dto/auth.dto"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"
import { MailService } from "../services/mail/mail.service"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { BadReqException } from "@/exceptions/badRequest.exception"

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private helperService: HelpersService,
    private configService: ConfigService,
    private mailService: MailService
  ) {}

  async generateOtp(number: number, email: string) {
    return await this.userService.generateOtp(number, email)
  }

  async register(data: AuthDto) {
    const createdUser = await this.userService.create(data)
    const otp = await this.generateOtp(6, createdUser.email)
    // this.mailService.send({
    //   to: createdUser.email,
    //   subject: "Email Validation",
    //   text: `Validate with your otp code: ${otp.code}. Your code expires in 10mins`
    // })
    const payload = { email: createdUser.email, id: createdUser.id }
    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
    console.log("token", token)
    return { token }
  }

  async resendOtp(email: string) {
    const otp = await this.generateOtp(6, email)
    const user = await this.userService.findOne({ email: otp.email })
    const payload = {
      email: user.email,
      id: user.id
    }
    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
    this.mailService.send({
      to: user.email,
      subject: "otp code",
      text: `Validate with your otp code: ${otp.code}. Your code expires in 10mins`
    })
    return { token }
  }

  async verifyEmail(code: number) {
    const otp = await this.userService.findUserOtp({ code })
    if (!otp) throw new NotFoundException("OTP not found")

    const user = await this.userService.findOne({ email: otp.email })
    const updateUser = await this.userService.update(user, { isEmailVerified: true })
    console.log(updateUser)
    const payload = { email: user.email, id: user.id }
    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
    return { token }
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.userService.findOne({ email: loginDto.email })
    if (!user) throw new NotFoundException("Invalid Credentials")

    const match = await user.comparePassword(loginDto.password)

    if (!match) throw new BadReqException("Invalid Credentials")

    return user
  }

  async login(loginDto: LoginAuthDto) {
    const payload = { email: loginDto.email, id: loginDto.id }
    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").jwtSecret, "1d")
    const refreshToken = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").refreshSecret, "30d")
    return { acecess_token: token, refreshToken }
  }
}
