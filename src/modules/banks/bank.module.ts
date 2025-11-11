import { Module } from "@nestjs/common"
import { BankService } from "./bank.service"
import { BankController } from "./bank.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Bank } from "./entities/bank.entity"
import { UserModule } from "../users/user.module"
import { JwtModule } from "@nestjs/jwt"
import { jwtConfig } from "@/config/jwt.config"

@Module({
  imports: [TypeOrmModule.forFeature([Bank]), UserModule, JwtModule.registerAsync(jwtConfig)],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService]
})
export class BankModule {}
