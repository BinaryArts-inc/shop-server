import { registerAs } from "@nestjs/config"

type ENV = "local" | "development" | "staging" | "production"

export interface IApp {
  name: string
  env: ENV
  url: string
  clientUrl: string
  port: number
}

export default registerAs(
  "app",
  (): IApp => ({
    name: process.env.APP_NAME,
    env: (process.env.NODE_ENV as ENV) || "development",
    url: process.env.APP_URL || "http://localhost:5000",
    clientUrl: process.env.CLIENT_URL,
    port: Number(process.env.PORT) || 5000
  })
)
