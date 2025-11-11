import { Ad } from "@/modules/ads/entities/ad.entity"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"

export enum PromotionTypeEnum {
  "BANNER" = "banner",
  "SEARCH" = "search",
  "FEATURED" = "featured"
}

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ type: "enum", enum: PromotionTypeEnum, default: PromotionTypeEnum.FEATURED })
  type: PromotionTypeEnum

  @Column()
  duration: number // in days

  @Column({ type: "float" })
  amount: number

  @OneToMany(() => Ad, (ad) => ad.promotion)
  ads: Ad[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
