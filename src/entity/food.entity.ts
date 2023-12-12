import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Consumption } from "./consumption.entity";

@Entity()
export class Food {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  calories: number;

  @OneToMany(() => Consumption, (data) => data.food)
  consumptions: Consumption[];
}
