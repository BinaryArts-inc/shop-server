import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UserModule } from "../user/user.module"
import { JwtModule } from "@nestjs/jwt"
import { jwtConfig } from "@/config/jwt.config"
import { JwtStrategy } from "./strategy/jwt.strategy"
import { PasswordStrategy } from "./strategy/password.strategy"
import { LocalStrategy } from "./strategy/local.strategy"

@Module({
  imports: [UserModule, JwtModule.registerAsync(jwtConfig)],
  controllers: [AuthController],
  providers: [AuthService, PasswordStrategy, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
