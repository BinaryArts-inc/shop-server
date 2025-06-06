import { Module } from "@nestjs/common"
import { StoreService } from "./store.service"
import { StoreController } from "./store.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Store } from "./entities/store.entity"
import { ServicesModule } from "../services/services.module"
import { SharedModule } from "../services/sharedModule/sharedModule"
import { UserModule } from "../user/user.module"
import { jwtConfig } from "@/config/jwt.config"
import { JwtModule } from "@nestjs/jwt"

@Module({
  imports: [TypeOrmModule.forFeature([Store]), UserModule, SharedModule, ServicesModule, JwtModule.registerAsync(jwtConfig)],
  controllers: [StoreController],
  providers: [StoreService]
})
export class StoreModule {}
