import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Consumption } from "./consumption.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Consumption, (consumption) => consumption.user)
  consumptions: Consumption[];
}
