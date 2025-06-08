import { Request } from "express"
import { AuthService } from "./auth.service"
import { Public } from "./decorators/public.decorator"
import { Controller, Post, Body, HttpCode, Patch, UseGuards, Req, UseInterceptors, ConflictException, UploadedFile } from "@nestjs/common"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { AuthDto, registerSchema, ResendOtpDto, resendOtpSchema, VerifyEmailDto, verifyEmailSchema } from "./dto/auth.dto"
import JwtShortTimeGuard from "./guard/jwt-short-time.guard"
import { PasswordAuthGuard } from "./guard/password-auth.guard"
import { LoginValidationGuard } from "./guard/login-validation.guard"
import { ShortTime } from "./decorators/short-time.decorator"
import { AuthInterceptor } from "./interceptors/auth.interceptor"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { MailService } from "../services/mail/mail.service"
import { UserService } from "../user/user.service"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"
import { TransactionHelper } from "../services/utils/transactions/transactions.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { OnboardBusinessDto, onboardBusinessSchema } from "./dto/onboard-business.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskUpload, imageFilter } from "@/config/multer.config"
import { OnboardStoreDto, onboardStoreSchema } from "./dto/onboard-store.dto"
import { User } from "../user/decorator/user.decorator"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { FileSystemService } from "../services/filesystem/filesystem.service"
import { StoreService } from "../store/store.service"

@Public()
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private helperService: HelpersService,
    private mailService: MailService,
    private userService: UserService,
    private configService: ConfigService,
    private readonly transactionHelper: TransactionHelper,
    private readonly fileSystemService: FileSystemService,
    private readonly storeService: StoreService
  ) {}

  @Post("/register")
  @HttpCode(201)
  async register(@Body(new JoiValidationPipe(registerSchema)) registerDto: AuthDto) {
    return this.transactionHelper.runInTransaction(async (manager) => {
      const { email, id } = await this.userService.create(registerDto, manager)

      const code = this.helperService.generateOtp(6)

      const otp = await this.authService.saveOtp({ code, email }, manager)

      this.mailService.send({
        to: registerDto.email,
        subject: "Email Validation",
        text: `Validate with your otp code: ${otp.code}. Your code expires in 10mins`
      })

      const shortTimeToken = await this.helperService.generateToken({ email, id }, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")

      return { token: shortTimeToken }
    })
  }

  @ShortTime()
  @Post("/verifyemail")
  @HttpCode(200)
  @UseGuards(JwtShortTimeGuard)
  async verifyEmail(@Req() req: Request, @Body(new JoiValidationPipe(verifyEmailSchema)) verifyEmailDto: VerifyEmailDto) {
    const isVerified = await this.authService.verifyCode({ email: req.user.email, code: verifyEmailDto.code })
    await this.userService.update(req.user, { isEmailVerified: isVerified })

    const shortTimeToken = await this.helperService.generateToken(
      { email: req.user.email, id: req.user.id },
      this.configService.get<IAuth>("auth").shortTimeJwtSecret,
      "1h"
    )

    return { token: shortTimeToken }
  }

  @ShortTime()
  @UseGuards(JwtShortTimeGuard)
  @Post("/business")
  async onboardBusiness(@Body(new JoiValidationPipe(onboardBusinessSchema)) userBusinessDto: OnboardBusinessDto, @Req() req: Request) {
    const user = req.user

    const business = await this.userService.findOneBusiness({ user: { id: user.id } })
    if (business) throw new ConflictException("User already created a business")

    await this.userService.createUserBusiness(userBusinessDto, user)

    const payload = { email: user.email, id: user.id }

    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")

    return { token }
  }

  @ShortTime()
  @Post("/store")
  @UseGuards(JwtShortTimeGuard)
  @UseInterceptors(FileInterceptor("image", { ...diskUpload, fileFilter: imageFilter }))
  async create(
    @Body(new JoiValidationPipe(onboardStoreSchema)) onboardStoreDto: OnboardStoreDto,
    @UploadedFile() fileUploaded: CustomFile,
    @User("id") userId: string
  ) {
    const fileDto: FileUploadDto = {
      destination: `images/${fileUploaded.originalname}-storelogo.${fileUploaded.extension}`,
      mimetype: fileUploaded.mimetype,
      buffer: fileUploaded.buffer,
      filePath: fileUploaded.path
    }

    const url = await this.fileSystemService.upload(fileDto)

    onboardStoreDto = { ...onboardStoreDto, logo: url }

    const business = await this.userService.getUserBusiness({ user: { id: userId } })
    if (!business) throw new NotFoundException("Business does not exist")

    if (await this.storeService.exist({ name: onboardStoreDto.name })) throw new ConflictException("Store name already exist")

    this.storeService.create(onboardStoreDto, business)

    const payload = { email: business.user.email, id: business.user.id }
    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
    return { token }
  }

  @Post("/login/password")
  @HttpCode(200)
  @UseInterceptors(AuthInterceptor)
  @UseGuards(LoginValidationGuard, PasswordAuthGuard)
  async login(@Req() req: Request) {
    return await this.authService.login({ email: req.user.email, id: req.user.id }, req.user)
  }

  @Patch("/resendotp")
  async resendOtp(@Body(new JoiValidationPipe(resendOtpSchema)) { email }: ResendOtpDto) {
    const user = await this.userService.findOne({ email })
    if (!user) throw new NotFoundException("user not found")

    const code = this.helperService.generateOtp(6)
    const otp = await this.authService.saveOtp({ code, email })

    await this.mailService.send({
      to: email,
      subject: "Email Validation",
      text: `Validate with your otp code: ${otp.code}. Your code expires in 10mins`
    })

    const shortTimeToken = await this.helperService.generateToken(
      { email, id: user.id },
      this.configService.get<IAuth>("auth").shortTimeJwtSecret,
      "1h"
    )

    return { token: shortTimeToken }
  }
}
