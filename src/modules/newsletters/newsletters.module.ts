import { Module } from "@nestjs/common"
import { NewslettersService } from "./newsletters.service"
import { NewslettersController } from "./newsletters.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Newsletter } from "./entities/newsletter.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter])],
  controllers: [NewslettersController],
  providers: [NewslettersService]
})
export class NewslettersModule {}
