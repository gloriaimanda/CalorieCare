import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  is_logout: boolean;
}
