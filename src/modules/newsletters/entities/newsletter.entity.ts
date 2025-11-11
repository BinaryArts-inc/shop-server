import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Newsletter {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  email: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
