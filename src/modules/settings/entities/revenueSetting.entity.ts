import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, Column } from "typeorm"
import { Setting } from "./setting.entity"

@Entity()
export class RevenueSetting {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  settingId: string

  // payout
  @Column({ default: 10000 })
  minPayoutAmount: number

  @Column({ default: 100000 })
  maxPayoutAmount: number

  @Column({ default: 1 })
  maxWithdrawalsPerDay: number

  // Fulfillment & Gas Fee
  @Column({ default: 10 })
  fulfillmentFeePercentage: number

  @Column({ default: 1000 })
  gasFee: number

  // Vendor Subscription
  @Column({ default: 10000 })
  monthlySubscriptionFee: number

  @Column({ default: 100000 })
  yearlySubscriptionFee: number

  @Column({ default: 7 })
  gracePeriodAfterExpiry: number

  // Notifications
  @Column({ default: true })
  autoExpiryNotification: boolean

  @Column({ default: true })
  notifyUserOnApproval: boolean

  @Column({ default: true })
  notifyOnSubscriptionExpiry: boolean

  @Column({ default: true })
  notifyOnCommissionDeduction: boolean

  @OneToOne(() => Setting, (setting) => setting.revenueSetting)
  setting: Setting

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
