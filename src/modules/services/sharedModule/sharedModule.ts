import { Module } from "@nestjs/common"
import JwtShortTimeGuard from "../../auth/guard/jwt-short-time.guard"
import { JwtModule } from "@nestjs/jwt"
import { jwtConfig } from "@/config/jwt.config"

@Module({
  imports: [JwtModule.registerAsync(jwtConfig)],
  providers: [JwtShortTimeGuard],
  exports: [JwtShortTimeGuard]
})
export class SharedModule {}
