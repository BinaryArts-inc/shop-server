import { Global, Module } from "@nestjs/common"
import { UtilsModule } from "./utils/utils.module"
import { PaginationModule } from "./pagination/pagination.module"
import { MailModule } from "./mail/mail.module"
import { mailConfigAsync } from "@/config/mail.config"
import { PaginationService } from "./pagination/pagination.service"
import { FileSystemModule } from "./filesystem/filesystem.module"
import { fileConfigAsync } from "@/config/filesystems.config"
import { SharedModule } from "./sharedModule/sharedModule"

@Global()
@Module({
  imports: [PaginationModule, UtilsModule, MailModule.registerAsync(mailConfigAsync), FileSystemModule.registerAsync(fileConfigAsync), SharedModule],
  providers: [PaginationService],
  exports: [MailModule, PaginationService, UtilsModule, FileSystemModule, SharedModule]
})
export class ServicesModule {}
