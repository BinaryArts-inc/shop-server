import { Promotion, PromotionTypeEnum } from "@/modules/promotions/entities/promotion.entity"
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { AD_STATUS } from "../enums/ad-status.enum"
import { AdStatus } from "../interfaces/ad-status.interface"
import { Product } from "@/modules/products/entities/product.entity"

@Entity()
export class Ad {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  duration: number

  @Column()
  amount: number

  @Column()
  productId: string

  @Column()
  reference: string

  @Column()
  promotionId: string

  @Column("int", { default: 0 })
  clicks: number

  @Column("int", { default: 0 })
  impressions: number

  @Column("float", { default: 0 })
  conversionRate: number

  @Column({ type: "enum", enum: PromotionTypeEnum })
  type: PromotionTypeEnum

  @Column({ type: "timestamp", nullable: true })
  startDate: Date

  @Column({ type: "timestamp", nullable: true })
  endDate: Date

  @Column({ type: "enum", enum: AD_STATUS, default: "inactive" })
  status: AdStatus

  @ManyToOne(() => Product, (product) => product.ads, { eager: true })
  product: Product

  @ManyToOne(() => Promotion, (promotion) => promotion.ads)
  promotion: Promotion

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
