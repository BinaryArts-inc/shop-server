import { registerAs } from "@nestjs/config"

export default registerAs(
  "auth",
  (): IAuth => ({
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    resetSecret: process.env.RESET_TOKEN_SECRET,
    shortTimeJwtSecret: process.env.SHORT_TIME_SECRET
  })
)

export interface IAuth {
  jwtSecret: string
  resetSecret: string
  refreshSecret: string
  shortTimeJwtSecret: string
}
