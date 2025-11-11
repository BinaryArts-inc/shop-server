import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from "typeorm"
import { Product } from "@/modules/products/entities/product.entity"
import { User } from "@/modules/users/entity/user.entity"

@Entity()
export class SavedProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  userId: string

  @Column()
  productId: string

  @Column({ type: "boolean", default: false })
  isLiked: boolean

  @ManyToOne(() => User, (user) => user.savedProducts, { onDelete: "CASCADE" })
  user: User

  @ManyToOne(() => Product, (product) => product.savedBy, { onDelete: "CASCADE", eager: true })
  product: Product

  @CreateDateColumn()
  createdAt: Date
}
