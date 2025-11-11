import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"
import * as bcrypt from "bcryptjs"
import { Bank } from "@/modules/banks/entities/bank.entity"
import { Product } from "@/modules/products/entities/product.entity"
import { Cart } from "@/modules/carts/entities/cart.entity"
import Business from "@/modules/business/entities/business.entity"
import { SavedProduct } from "@/modules/products/entities/saved-product.entity"
import { Order } from "@/modules/orders/entities/order.entity"
import { Review } from "@/modules/reviews/entities/review.entity"
import { Subscription } from "@/modules/subscription/entities/subscription.entity"
import { userStatus } from "../interfaces/user.status.interface"
import { USER_STATUS } from "../enum/user-status"
import { Voucher } from "@/modules/vouchers/entities/voucher.entity"

export enum UserRoleEnum {
  "Customer" = "customer",
  "Vendor" = "vendor",
  "Admin" = "admin",
  "Rider" = "rider"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  password: string

  @Column({ type: "enum", enum: UserRoleEnum, default: UserRoleEnum.Customer })
  role: UserRoleEnum

  @Column()
  email: string

  @Column({ type: "text", default: "" })
  phoneNumber: string

  @Column({ type: "text", default: "" })
  address: string

  @Column({ type: "text", default: "" })
  profileImage: string

  @Column({ default: false })
  isEmailVerified: boolean

  @Column({ type: "enum", enum: USER_STATUS, default: "inactive" })
  status: userStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: "int", default: 0 })
  itemsCount: number

  @Column({ type: "int", default: 0 })
  ordersCount: number

  @Column("text", { array: true, default: "{}" })
  fcmToken: string[]

  @OneToOne(() => Business, (business) => business.user, { eager: true })
  business: Business

  @OneToMany(() => Bank, (bank) => bank.user)
  bank: Bank[]

  @OneToMany(() => Product, (product) => product.user)
  product: Product[]

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[]

  @OneToMany(() => SavedProduct, (saved) => saved.user)
  savedProducts: SavedProduct[]

  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[]

  @OneToMany(() => Review, (review) => review.reviewer)
  reviews: Review[]

  @OneToMany(() => Subscription, (subscription) => subscription.vendor)
  subscriptions: Subscription[]

  @OneToMany(() => Voucher, (voucher) => voucher.user)
  vouchers: Voucher[]

  private _previousPassword?: string

  @AfterLoad()
  loadPassword() {
    this._previousPassword = this.password
  }

  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    if (!this.password || this.password === this._previousPassword) return

    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
  }

  async comparePassword(password: string) {
    return await bcrypt.compare(password, this.password)
  }

  getFullName() {
    return this.firstName + " " + this.lastName
  }
}
