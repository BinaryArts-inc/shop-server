import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Seeder } from "nestjs-seeder"
import { Repository } from "typeorm"
import { faker } from "@faker-js/faker"
import { Promotion, PromotionTypeEnum } from "../promotions/entities/promotion.entity"

@Injectable()
export class PromotionSeeder implements Seeder {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>
  ) {}

  async seed(): Promise<any> {
    const dto = [
      {
        name: "Search Boost (7 days)",
        duration: 7, // in days
        type: PromotionTypeEnum.SEARCH, // banner, featured, search
        amount: 20000
      },
      {
        name: "Featured Products (48 days)",
        duration: 48, // in days
        type: PromotionTypeEnum.FEATURED, // banner, featured, search
        amount: 100000
      },
      {
        name: "Banner Ads ( 4 days)",
        duration: 4, // in days
        type: PromotionTypeEnum.BANNER, // banner, featured, search
        amount: 10000
      }
    ]
    // Generate promotion data for each user
    const promotions = dto.map((promo) => ({
      name: promo.name,
      duration: promo.duration,
      amount: promo.amount,
      type: promo.type,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }))

    // Create and save promotion entities
    const promotionEntities = this.promotionRepository.create(promotions)
    await this.promotionRepository.save(promotionEntities)
  }

  async drop(): Promise<any> {
    await this.promotionRepository.delete({})
  }
}
