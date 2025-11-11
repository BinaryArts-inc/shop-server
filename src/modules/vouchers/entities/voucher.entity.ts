import { User } from "@/modules/users/entity/user.entity"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"
import { VoucherEnum } from "../enum/voucher-enum"
import { CouponEnumType } from "@/modules/coupons/enum/coupon-enum"

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  userId: string

  @Column({ type: "enum", enum: VoucherEnum, default: VoucherEnum.PENDING })
  status: VoucherEnum

  @Column()
  code: string

  @Column({ nullable: true })
  orderId: string

  @Column({ type: "timestamp" })
  dateWon: Date

  @Column({ type: "timestamp" })
  startDate: Date

  @Column({ type: "timestamp" })
  endDate: Date

  @Column({ type: "decimal", precision: 10, scale: 2 })
  prizeWon: number

  @Column({ type: "enum", enum: CouponEnumType, default: CouponEnumType.AMOUNT })
  prizeType: CouponEnumType

  @ManyToOne(() => User, (user) => user.vouchers)
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
