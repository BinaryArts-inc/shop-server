import { User } from "@/modules/users/entity/user.entity"
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne } from "typeorm"

@Entity()
export class Bank {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  bankName: string

  @Column({ unique: true })
  accountNumber: string

  @Column()
  accountName: string

  @Column()
  code: string

  @Column()
  recipientCode: string

  @ManyToOne(() => User, (user) => user.bank, { eager: true })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  isMyBank(userId: string) {
    return this.user.id === userId
  }
}
