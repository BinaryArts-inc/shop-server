import { registerAs } from "@nestjs/config"

export default registerAs(
  "auth",
  (): IAuth => ({
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    resetSecret: process.env.RESET_TOKEN_SECRET,
    shortTimeJwtSecret: process.env.SHORT_TIME_SECRET,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL
    }
  })
)

export interface IAuth {
  jwtSecret: string
  resetSecret: string
  refreshSecret: string
  shortTimeJwtSecret: string
  google: {
    clientId: string
    clientSecret: string
    callbackUrl: string
  }
}
