import { User } from "@/modules/users/entity/user.entity"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Product } from "@/modules/products/entities/product.entity"

@Entity()
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn()
  user: User

  @ManyToOne(() => Product, { eager: true })
  product: Product

  @Column({ type: "int" })
  quantity: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
