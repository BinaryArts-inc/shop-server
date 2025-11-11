import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm"
import { Setting } from "./setting.entity"

@Entity()
export class PromotionSetting {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  settingId: string

  // Promotion Management
  @Column({ default: 7 })
  defaultDurationDays: number

  @Column({ default: 3 })
  maxPromotionsPerDay: number

  @Column({ default: true })
  bannerPromotion: boolean

  @Column({ default: true })
  featuredSectionPromotion: boolean

  @Column({ default: true })
  autoApprovePromotions: boolean

  // Notifications
  @Column({ default: true })
  notifyVendorOnApproval: boolean

  @Column({ default: true })
  notifyOnNewRequest: boolean

  @OneToOne(() => Setting, (setting) => setting.promotionSetting)
  setting: Setting

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  UpdatedAt: Date
}
