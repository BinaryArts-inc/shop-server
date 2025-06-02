import { Module } from "@nestjs/common"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import User from "./entity/user.entity"
import { Otp } from "./entity/otp.entity"
import Business from "./entity/business.entity"
import { ConfigModule } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { jwtConfig } from "@/config/jwt.config"
import { ServicesModule } from "../services/services.module"

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp, Business]), ServicesModule, ConfigModule, JwtModule.registerAsync(jwtConfig)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
