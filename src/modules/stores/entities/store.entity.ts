import Business from "@/modules/business/entities/business.entity"
import { Payout } from "@/modules/payouts/entities/payout.entity"
import { Product } from "@/modules/products/entities/product.entity"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from "typeorm"
import { IStoreShortResponse } from "../interface/short-format-response.interface"
import { Commision } from "@/modules/commisions/entities/commision.entity"

// TODO: ENDPOINT TO RETURN AN ARRAY OF STORE CATEGORIES ENUM

export enum vendonEnumType {
  "PREMIUM" = "premium",
  "SKISHOP" = "skishop",
  "BASIC" = "basic"
}
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

  @Column({ type: "boolean", default: false })
  isStarSeller: boolean

  @Column({ type: "int", default: 0 })
  numberOfSales: number

  @Column({ type: "int", default: 0 })
  totalStoreRatingSum: number

  @Column({ type: "int", default: 0 })
  totalStoreRatingCount: number

  @OneToOne(() => Business, (business) => business.store)
  @JoinColumn()
  business: Business

  @OneToOne(() => Payout, (payout) => payout.store)
  @JoinColumn()
  payout: Payout

  @OneToMany(() => Product, (product) => product.store)
  products: Product[]

  @OneToMany(() => Commision, (commision) => commision.store)
  commisions: Commision[]

  @Column({ type: "enum", enum: vendonEnumType, default: vendonEnumType.BASIC })
  type: vendonEnumType

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updateAt: Date

  getShortFormat(): IStoreShortResponse {
    return {
      id: this.id,
      name: this.name,
      logo: this.logo,
      isStarSeller: this.isStarSeller
    }
  }
}
