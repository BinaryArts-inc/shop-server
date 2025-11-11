import { seeder } from "nestjs-seeder"
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from "./modules/users/entity/user.entity"
import { databaseConfigAsync } from "./config/database.config"
import { ConfigModule } from "@nestjs/config"
import appConfig from "./config/app.config"
import mailConfig from "./config/mail.config"
import filesystemsConfig from "./config/filesystems.config"
import authConfig from "./config/auth.config"
import { Bank } from "./modules/banks/entities/bank.entity"
import { Store } from "./modules/stores/entities/store.entity"
import { Product } from "./modules/products/entities/product.entity"
import { UserSeeder } from "./modules/seeder/user.seeder"
import { BusinessSeeder } from "./modules/seeder/business.seeder"
import { StoreSeeder } from "./modules/seeder/store.seeder"
import { BankSeeder } from "./modules/seeder/bank.seeder"
import { ProductSeeder } from "./modules/seeder/product.seeder"
import { Cart } from "./modules/carts/entities/cart.entity"
import logConfig from "./config/log.config"
import Business from "./modules/business/entities/business.entity"
import { SavedProduct } from "./modules/products/entities/saved-product.entity"
import { Order } from "./modules/orders/entities/order.entity"
import { OrderItem } from "./modules/orders/entities/order-item.entity"
import { Review } from "./modules/reviews/entities/review.entity"
import { Withdrawal } from "./modules/withdrawals/entities/withdrawal.entity"
import { Subscription } from "./modules/subscription/entities/subscription.entity"
import { Plan } from "./modules/plans/entities/plan.entity"
import { Payout } from "./modules/payouts/entities/payout.entity"
import { Promotion } from "./modules/promotions/entities/promotion.entity"
import { Ad } from "./modules/ads/entities/ad.entity"
import { PromotionSeeder } from "./modules/seeder/promotion.seeder"
import { PlanSeeder } from "./modules/seeder/plan.seeder"
import { Voucher } from "./modules/vouchers/entities/voucher.entity"
import { Coupon } from "./modules/coupons/entities/coupon.entity"
import { Setting } from "./modules/settings/entities/setting.entity"
import { Commision } from "./modules/commisions/entities/commision.entity"
import { RevenueSetting } from "./modules/settings/entities/revenueSetting.entity"
import { Play2winSetting } from "./modules/settings/entities/play2winSetting.entity"
import { PromotionSetting } from "./modules/settings/entities/promotionSetting.entity"
import { GeneralSetting } from "./modules/settings/entities/general.entity"
import { SettingSeeder } from "./modules/seeder/setting.seeder"
import { RevenueSettingSeeder } from "./modules/seeder/revenue-setting.seeder"
import { Play2WinSeeder } from "./modules/seeder/play-2-win.seeder"
import { PromotionSettingSeeder } from "./modules/seeder/promotion-setting.seeder"
import { GeneralSeeder } from "./modules/seeder/general.seeder"

seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, mailConfig, filesystemsConfig, logConfig]
    }),
    TypeOrmModule.forRootAsync(databaseConfigAsync),
    TypeOrmModule.forFeature([
      User,
      Business,
      Bank,
      Store,
      Product,
      Cart,
      SavedProduct,
      Order,
      OrderItem,
      Review,
      Withdrawal,
      Subscription,
      Plan,
      Payout,
      Promotion,
      Ad,
      Voucher,
      Coupon,
      Setting,
      Commision,
      RevenueSetting,
      Play2winSetting,
      PromotionSetting,
      GeneralSetting
    ])
  ],
  providers: [UserSeeder, BusinessSeeder, StoreSeeder, BankSeeder, ProductSeeder, PromotionSeeder, PlanSeeder]
}).run([
  UserSeeder,
  BusinessSeeder,
  StoreSeeder,
  BankSeeder,
  ProductSeeder,
  PromotionSeeder,
  PlanSeeder,
  SettingSeeder,
  RevenueSettingSeeder,
  Play2WinSeeder,
  PromotionSettingSeeder,
  GeneralSeeder
])
