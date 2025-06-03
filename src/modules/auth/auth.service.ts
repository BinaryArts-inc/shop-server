import { Injectable } from "@nestjs/common"
import { UserService } from "../user/user.service"
import { LoginAuthDto, LoginDto } from "./dto/auth.dto"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"
import { MailService } from "../services/mail/mail.service"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { BadReqException } from "@/exceptions/badRequest.exception"
import User from "../user/entity/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Otp } from "./entities/otp.entity"
import { EntityManager, Repository } from "typeorm"
import { DateService } from "../services/utils/date/date.service"
import { SaveOtpDto } from "./dto/save-otp.dto"

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private helperService: HelpersService,
    private dateService: DateService,
    private configService: ConfigService,
    private mailService: MailService,

    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>
  ) {}

  // refactors
  // import otp repository in the auth service so it is not dependent on the user service
  //
  // async register(data: AuthDto) {
  //   const createdUser = await this.userService.create(data)

  //   const code = this.helperService.generateOtp(6)

  //   // const otp = await this.userService.generateOtp(6, createdUser.email)

  //   this.mailService.send({
  //     to: createdUser.email,
  //     subject: "Email Validation",
  //     text: `Validate with your otp code: ${otp.code}. Your code expires in 10mins`
  //   })

  //   const payload = { email: createdUser.email, id: createdUser.id }
  //   const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
  //   return { token }
  // }

  async saveOtp({ code, email }: SaveOtpDto, manager?: EntityManager) {
    const repo = manager ? manager.getRepository<Otp>(Otp) : this.otpRepository

    const otpData = {
      code,
      email,
      expireAt: this.dateService.addMinutes(10)
    }

    await repo.upsert(otpData, ["email"])
    return repo.findOne({ where: { email } })
  }

  // async resendOtp(email: string) {
  //   console.log("email", email)

  //   // const otp = await this.userService.generateOtp(6, email)
  //   // const user = await this.userService.findOne({ email: otp.email })
  //   // const payload = {
  //   //   email: user.email,
  //   //   id: user.id
  //   // }
  //   // const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
  //   // this.mailService.send({
  //   //   to: user.email,
  //   //   subject: "otp code",
  //   //   text: `Validate with your otp code: ${otp.code}. Your code expires in 10mins`
  //   // })
  //   return { token: "" }
  // }

  // async verifyEmail(code: number) {
  //   const otp = await this.userService.findUserOtp({ code })
  //   if (!otp) throw new NotFoundException("OTP not found")

  //   const user = await this.userService.findOne({ email: otp.email })
  //   const updateUser = await this.userService.update(user, { isEmailVerified: true })
  //   console.log(updateUser)
  //   const payload = { email: user.email, id: user.id }
  //   const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
  //   return { token }
  // }

  async validateUser(loginDto: LoginDto) {
    const user = await this.userService.findOne({ email: loginDto.email })
    if (!user) throw new NotFoundException("Invalid Credentials")

    const match = await user.comparePassword(loginDto.password)

    if (!match) throw new BadReqException("Invalid Credentials")

    return user
  }

  async login(loginDto: LoginAuthDto, user: User) {
    const payload = { email: loginDto.email, id: loginDto.id }
    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").jwtSecret, "1d")
    const refreshToken = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").refreshSecret, "30d")
    return { user, tokens: { acecess_token: token, refreshToken } }
  }
}
