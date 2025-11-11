import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Store } from "@/modules/stores/entities/store.entity"
import { OrderItem } from "@/modules/orders/entities/order-item.entity"

@Entity()
export class Commision {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "float" })
  amount: number // amound deducted

  @Column()
  orderItemId: string

  @Column()
  storeId: string

  @Column({ type: "float" })
  value: number // % deducted

  @OneToOne(() => OrderItem)
  @JoinColumn()
  orderItem: OrderItem

  @ManyToOne(() => Store, (store) => store.commisions)
  store: Store

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
