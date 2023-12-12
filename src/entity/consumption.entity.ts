import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Food } from "./food.entity";

@Entity()
export class Consumption {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (data) => data.consumptions)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Food, (data) => data.consumptions)
  @JoinColumn({ name: "food_id" })
  food: Food;
}
