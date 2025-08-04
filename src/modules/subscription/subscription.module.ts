import { Module } from "@nestjs/common"
import { SubscriptionService } from "./subscription.service"
import { SubscriptionController } from "./subscription.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Subscription } from "./entities/subscription.entity"
import { PlansModule } from "../plans/plans.module"
import { BullModule } from "@nestjs/bullmq"
import { AppQueues } from "@/constants"
import { SubscriptionExpirationService } from "./subscription-expiration.service"

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), BullModule.registerQueue({ name: AppQueues.END_SUBSCRIPTION }), PlansModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionExpirationService],
  exports: [SubscriptionService]
})
export class SubscriptionModule {}
