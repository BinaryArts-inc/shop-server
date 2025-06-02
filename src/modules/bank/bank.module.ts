import { Module } from "@nestjs/common"
import { BankService } from "./bank.service"
import { BankController } from "./bank.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Bank } from "./entities/bank.entity"
import { UserModule } from "../user/user.module"
import { SharedModule } from "../services/sharedModule/sharedModule"
import { JwtModule } from "@nestjs/jwt"
import { jwtConfig } from "@/config/jwt.config"

@Module({
  imports: [TypeOrmModule.forFeature([Bank]), UserModule, SharedModule, JwtModule.registerAsync(jwtConfig)],
  controllers: [BankController],
  providers: [BankService]
})
export class BankModule {}
