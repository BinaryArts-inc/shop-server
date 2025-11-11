import { Module } from "@nestjs/common"
import { CommisionsService } from "./commisions.service"
import { CommisionsController } from "./commisions.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Commision } from "./entities/commision.entity"
import { SettingsModule } from "../settings/settings.module"

@Module({
  imports: [TypeOrmModule.forFeature([Commision]), SettingsModule],
  controllers: [CommisionsController],
  providers: [CommisionsService],
  exports: [CommisionsService]
})
export class CommisionsModule {}
