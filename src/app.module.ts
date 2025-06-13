import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./modules/auth/auth.module"
import { UserModule } from "./modules/user/user.module"
import { ConfigModule } from "@nestjs/config"
import appConfig from "./config/app.config"
import authConfig from "./config/auth.config"
import mailConfig from "./config/mail.config"
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { GlobalExceptionFilters } from "./exceptions/global.exception"
import { TypeOrmModule } from "@nestjs/typeorm"
import { databaseConfigAsync } from "./config/database.config"
import { TransformResponseInterceptor } from "./interceptors/response.interceptor"
import { ServicesModule } from "./modules/services/services.module"
import { UtilsModule } from "./modules/services/utils/utils.module"
import { StoreModule } from "./modules/store/store.module"
import { BankModule } from "./modules/banks/bank.module"
import filesystemsConfig from "./config/filesystems.config"
import { JwtGuard } from "./modules/auth/guard/jwt-auth.guard"
import { ProductsModule } from "./modules/products/products.module"

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, mailConfig, filesystemsConfig]
    }),
    TypeOrmModule.forRootAsync(databaseConfigAsync),
    ServicesModule,
    UtilsModule,
    StoreModule,
    BankModule,
    ProductsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilters
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard
    }
  ]
})
export class AppModule {}
