import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { Store } from "@/modules/stores/entities/store.entity"
import { User } from "@/modules/users/entity/user.entity"
import { KYC_ENUM_STATUS } from "../enum/kyc-status-enum"

@Entity()
export default class Business {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  type: string

  @Column({ type: "text", default: "" })
  name: string

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

  @Column({ type: "enum", enum: KYC_ENUM_STATUS, default: KYC_ENUM_STATUS.PENDING })
  kycStatus: KYC_ENUM_STATUS

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

  @OneToOne(() => Store, (store) => store.business, { eager: true })
  store: Store
}
