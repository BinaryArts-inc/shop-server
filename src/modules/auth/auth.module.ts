import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UserModule } from "../users/user.module"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { PasswordStrategy } from "./strategies/password.strategy"
import { Otp } from "./entities/otp.entity"
import { TypeOrmModule } from "@nestjs/typeorm"
import { JwtService } from "@nestjs/jwt"
import { StoreModule } from "../stores/store.module"
import { GoogleStrategy } from "./strategies/google.strategy"

@Module({
  imports: [UserModule, StoreModule, TypeOrmModule.forFeature([Otp])],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordStrategy, GoogleStrategy, JwtService]
})
export class AuthModule {}
