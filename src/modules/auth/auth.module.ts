import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UserModule } from "../user/user.module"
import { JwtModule } from "@nestjs/jwt"
import { jwtConfig } from "@/config/jwt.config"
import { JwtStrategy } from "./strategy/jwt.strategy"
import { PasswordStrategy } from "./strategy/password.strategy"
import { LocalStrategy } from "./strategy/local.strategy"
import { Otp } from "./entities/otp.entity"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
  imports: [UserModule, JwtModule.registerAsync(jwtConfig), TypeOrmModule.forFeature([Otp])],
  controllers: [AuthController],
  providers: [AuthService, PasswordStrategy, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
