import { Module } from "@nestjs/common"
import { StoreService } from "./store.service"
import { StoreController } from "./store.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Store } from "./entities/store.entity"
import { ServicesModule } from "../services/services.module"
import { jwtConfig } from "@/config/jwt.config"
import { JwtModule } from "@nestjs/jwt"
import { UpdateStoreMapper } from "./interface/update-store-mapper-interface"
import { BusinessModule } from "../business/business.module"

@Module({
  imports: [TypeOrmModule.forFeature([Store]), ServicesModule, JwtModule.registerAsync(jwtConfig), BusinessModule],
  controllers: [StoreController],
  providers: [StoreService, UpdateStoreMapper],
  exports: [StoreService]
})
export class StoreModule {}
