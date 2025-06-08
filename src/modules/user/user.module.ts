import { Module } from "@nestjs/common"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import User from "./entity/user.entity"
import Business from "./entity/business.entity"
import { ConfigModule } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"

@Module({
  imports: [TypeOrmModule.forFeature([User, Business]), ConfigModule],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [UserService]
})
export class UserModule {}
