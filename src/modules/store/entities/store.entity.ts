import { Product } from "@/modules/products/entities/product.entity"
import Business from "@/modules/user/entity/business.entity"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from "typeorm"

@Entity()
export class Store {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  logo: string

  @Column()
  // If category becomes managed by the backend, this should be changed to store the category ID instead or take account for the changes.
  // Currently, we store the category name as provided by the frontend.
  category: string

  @OneToOne(() => Business, (business) => business.store, { nullable: true, onDelete: "SET NULL" })
  business: Business

  @OneToMany(() => Product, (product) => product.store)
  product: Product[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updateAt: Date
}
