import { Global, Module } from "@nestjs/common"
import { UtilsModule } from "./utils/utils.module"
import { PaginationModule } from "./pagination/pagination.module"
import { MailModule } from "./mail/mail.module"
import { mailConfigAsync } from "@/config/mail.config"
import { PaginationService } from "./pagination/pagination.service"
import { FileSystemModule } from "./filesystem/filesystem.module"
import { fileConfigAsync } from "@/config/filesystems.config"
import { JwtModule } from "@nestjs/jwt"
import { jwtConfig } from "@/config/jwt.config"
import { CaslModule } from "./casl/casl.module"
import { LogModule } from "./log/log.module"
import { logConfigAsync } from "@/config/log.config"
import { LogService } from "./log/log.service"
import { MailService } from "./mail/mail.service"
import { PaymentsModule } from "./payments/payments.module"
import { HttpModule } from "@nestjs/axios"
import { paymentConfigAsync } from "@/config/payment.config"

@Global()
@Module({
  imports: [
    HttpModule,
    PaginationModule,
    UtilsModule,
    MailModule.registerAsync(mailConfigAsync),
    FileSystemModule.registerAsync(fileConfigAsync),
    JwtModule.registerAsync(jwtConfig),
    CaslModule,
    LogModule.registerAsync(logConfigAsync),
    PaymentsModule.registerAsync(paymentConfigAsync)
  ],
  providers: [PaginationService, LogService, MailService],
  exports: [MailService, PaginationService, UtilsModule, FileSystemModule, CaslModule, LogService, PaymentsModule]
})
export class ServicesModule {}
