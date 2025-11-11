import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Setting } from "./setting.entity"

@Entity()
export class Play2winSetting {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  settingId: string

  // Rules & Frequency
  @Column({ default: "Once Every 24 Hours" })
  playFrequency: string

  @Column({ default: 7 })
  redemptionWindowDays: number

  @Column({ default: "Once Every 24 Hours" })
  couponRedemptionFrequency: string

  @Column({ default: "08:00PM" })
  drawCycleResetTime: string

  @Column({ default: true })
  loginRequiredToPlay: boolean

  // Notifications
  @Column({ default: true })
  notifyAdminOnCouponExhaustion: boolean

  @Column({ default: true })
  showWinnersNotification: boolean

  @OneToOne(() => Setting, (setting) => setting.play2winSetting)
  setting: Setting

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
