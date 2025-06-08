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

@Global()
@Module({
  imports: [
    PaginationModule,
    UtilsModule,
    MailModule.registerAsync(mailConfigAsync),
    FileSystemModule.registerAsync(fileConfigAsync),
    JwtModule.registerAsync(jwtConfig)
  ],
  providers: [PaginationService],
  exports: [MailModule, PaginationService, UtilsModule, FileSystemModule]
})
export class ServicesModule {}
