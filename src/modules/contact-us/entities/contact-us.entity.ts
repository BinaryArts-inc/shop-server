import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class ContactUs {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  fullName: string

  @Column()
  email: string

  @Column()
  subject: string

  @Column({ type: "text" })
  message: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
