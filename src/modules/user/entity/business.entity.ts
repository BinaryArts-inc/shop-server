import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm"
import User from "./user.entity"
import { Store } from "@/modules/store/entities/store.entity"

@Entity()
export default class Business {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  type: string

  @Column({ type: "text", nullable: true, unique: true })
  businessRegNumber: string

  @Column()
  contactNumber: string

  @Column()
  address: string

  @Column()
  country: string

  @Column()
  state: string

  @Column()
  kycVerificationType: string

  @Column({ unique: true })
  identificationNumber: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User, (user) => user.business)
  @JoinColumn()
  user: User

  @OneToOne(() => Store, (store) => store.business)
  store: Store
}
