import User from "@/modules/user/entity/user.entity"
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne } from "typeorm"

@Entity()
export class Bank {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  bankName: string

  @Column()
  accountNumber: string

  @Column()
  accountName: string

  @ManyToOne(() => User, (user) => user.bank)
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
