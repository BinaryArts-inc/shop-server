import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Order } from "./order.entity"
import { Product } from "@/modules/products/entities/product.entity"

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  order: Order

  @Column("")
  productId: string

  @Column()
  storeId: string

  @ManyToOne(() => Product, { eager: true })
  product: Product

  @Column("int")
  quantity: number

  @Column("float")
  unitPrice: number // snapshot of product.price or product.discountPrice at time of order
}
