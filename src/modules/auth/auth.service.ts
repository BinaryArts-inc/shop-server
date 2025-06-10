import { Injectable } from "@nestjs/common"
import { UserService } from "../user/user.service"
import { LoginAuthDto, LoginDto } from "./dto/auth.dto"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { InjectRepository } from "@nestjs/typeorm"
import { Otp } from "./entities/otp.entity"
import { EntityManager, FindOptionsWhere, MoreThan, Repository } from "typeorm"
import { DateService } from "../services/utils/date/date.service"
import { SaveOtpDto } from "./dto/save-otp.dto"

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private helperService: HelpersService,
    private dateService: DateService,
    private configService: ConfigService,

    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>
  ) {}

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

  async verifyCode({ email, code }: FindOptionsWhere<Otp>) {
    const otp = await this.otpRepository.findOne({ where: { email, code, expireAt: MoreThan(new Date()) } })
    if (!otp) throw new NotFoundException("OTP not found")

    return true
  }

  async validateEmail(email: string) {
    const user = await this.userService.findOne({ email })
    if (!user) throw new NotFoundException("user not found")

    return user
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
    return { accessToken: token, refreshToken }
  }
}
