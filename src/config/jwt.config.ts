import { ConfigService } from "@nestjs/config"
import { JwtModuleAsyncOptions } from "@nestjs/jwt"

import { IAuth } from "./auth.config"

export const jwtConfig: JwtModuleAsyncOptions = {
  useFactory: async (configService: ConfigService) => {
    return {
      secret: configService.get<IAuth>("auth").jwtSecret,
      global: true,
      signOptions: { expiresIn: "1d" }
    }
  },
  inject: [ConfigService]
}
