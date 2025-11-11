import { Module } from "@nestjs/common"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { User } from "./entity/user.entity"

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [UserService]
})
export class UserModule {}
