import { Module } from "@nestjs/common"
import { DateService } from "./date/date.service"
import { HelpersService } from "./helpers/helpers.service"
import { TransactionHelper } from "./transactions/transactions.service"
import { JwtModule } from "@nestjs/jwt"
import { jwtConfig } from "@/config/jwt.config"

@Module({
  imports: [JwtModule.registerAsync(jwtConfig)],
  providers: [DateService, HelpersService, TransactionHelper],
  exports: [DateService, HelpersService, TransactionHelper]
})
export class UtilsModule {}
