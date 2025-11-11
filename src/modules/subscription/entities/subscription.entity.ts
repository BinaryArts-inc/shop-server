import { User } from "@/modules/users/entity/user.entity"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"

export enum SubscriptionEnum {
  "ACTIVE" = "active",
  "INACTIVE" = "inactive"
}
@Entity()
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  vendorId: string

  @Column({ nullable: true })
  reference: string

  @Column()
  planCode: string

  @Column({ default: "" })
  subscriptionCode: string

  @Column({ type: "timestamp", nullable: true })
  startDate?: Date

  @Column({ type: "timestamp", nullable: true })
  endDate?: Date

  @Column()
  planType: string // name of the plan

  @Column({ type: "enum", enum: SubscriptionEnum, default: SubscriptionEnum.INACTIVE })
  status: SubscriptionEnum

  @Column({ type: "boolean", default: false })
  isPaid: boolean

  @Column()
  amount: number

  @ManyToOne(() => User, (user) => user.subscriptions)
  vendor: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
