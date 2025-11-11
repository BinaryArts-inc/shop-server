import { ProductCategoriesEnum, ProductStatusEnum } from "@/modules/common/types"
import { Store } from "@/modules/stores/entities/store.entity"
import { User } from "@/modules/users/entity/user.entity"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, BeforeUpdate, BeforeInsert } from "typeorm"
import { SavedProduct } from "./saved-product.entity"
import { Review } from "@/modules/reviews/entities/review.entity"
import { Ad } from "@/modules/ads/entities/ad.entity"
import { BadReqException } from "@/exceptions/badRequest.exception"

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ type: "enum", enum: ProductCategoriesEnum })
  category: ProductCategoriesEnum

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

  @Column({ type: "int", default: 0 })
  totalProductRatingSum: number

  @Column({ type: "int", default: 0 })
  totalProductRatingCount: number

  @Column()
  storeId: string

  @Column()
  userId: string

  @ManyToOne(() => Store, (store) => store.products, { eager: true })
  store: Store

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User

  @OneToMany(() => SavedProduct, (saved) => saved.product)
  savedBy: SavedProduct[]

  @OneToMany(() => Review, (review) => review.product, { eager: true, cascade: true, onDelete: "CASCADE" })
  reviews: Review[]

  @OneToMany(() => Ad, (ad) => ad.product)
  ads: Ad[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeUpdate()
  @BeforeInsert()
  async validatePrices() {
    if (this.discountPrice > this.price) throw new BadReqException("Discount price cannot be greater than the original price")
  }
}
