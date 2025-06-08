import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UserModule } from "../user/user.module"
import { JwtStrategy } from "./strategy/jwt.strategy"
import { PasswordStrategy } from "./strategy/password.strategy"
import { Otp } from "./entities/otp.entity"
import { TypeOrmModule } from "@nestjs/typeorm"
import { JwtService } from "@nestjs/jwt"

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Otp])],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordStrategy, JwtService]
})
export class AuthModule {}
