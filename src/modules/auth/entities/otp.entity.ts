import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Otp {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  code: string

  @Column("timestamptz")
  expireAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
