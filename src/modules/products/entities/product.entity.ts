import { Store } from "@/modules/stores/entities/store.entity"
import { User } from "@/modules/users/entity/user.entity"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"

export enum ProductStatusEnum {
  draft = "draft",
  published = "published"
}
@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  category: string

  @Column()
  description: string

  @Column({ type: "float" })
  price: number

  @Column({ type: "float", nullable: true })
  discountPrice: number

  @Column({ type: "int" })
  stockCount: number

  @Column("text", { array: true })
  images: string[]

  @Column({ type: "enum", enum: ProductStatusEnum, default: ProductStatusEnum.draft })
  status: ProductStatusEnum

  @Column()
  storeId: string

  @Column()
  userId: string

  @ManyToOne(() => Store, (store) => store.product, { eager: true })
  store: Store

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
