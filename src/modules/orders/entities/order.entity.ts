import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { OrderItem } from "./order-item.entity"
import { ORDER_STATUS, OrderStatus } from "../interfaces/order-status"
import { User } from "@/modules/users/entity/user.entity"
import { PAYMENT_METHODS, PaymentMethod } from "../interfaces/payment-method.interface"
import { ORDER_DELIVERY_STATUS, OrderDeliveryStatus } from "../interfaces/delivery-status"

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "enum", default: "pending", enum: ORDER_STATUS })
  status: OrderStatus

  @Column({ type: "enum", default: "uninitiated", enum: ORDER_DELIVERY_STATUS })
  deliveryStatus: OrderDeliveryStatus

  @Column({ type: "enum", enum: PAYMENT_METHODS })
  paymentMethod: PaymentMethod

  @Column({ type: "text", default: "" })
  reference: string

  @Column()
  buyerId: string

  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  @JoinColumn()
  buyer: User

  @OneToMany(() => OrderItem, (item) => item.order, { eager: true, cascade: true })
  items: OrderItem[]

  @Column({ type: "timestamp", nullable: true })
  paidAt: Date

  @CreateDateColumn()
  createdAt: Date
}
