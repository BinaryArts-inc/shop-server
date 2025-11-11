import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { CouponEnumType } from "../enum/coupon-enum"

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column({ type: "varchar", length: 50 })
  code: string

  @Column({ type: "int" })
  quantity: number

  @Column({ type: "int" })
  remainingQuantity: number

  @Column({ type: "enum", enum: CouponEnumType, default: CouponEnumType.AMOUNT })
  couponType: CouponEnumType

  @Column({ type: "decimal", precision: 10, scale: 2 })
  value: number

  @Column({ type: "timestamp" })
  startDate: Date

  @Column({ type: "timestamp" })
  endDate: Date

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date
}
