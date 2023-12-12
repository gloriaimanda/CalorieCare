import { DataSource } from "typeorm";
import { User } from "./src/entity/user.entity";
import { Token } from "./src/entity/token.entity";
import { Food } from "./src/entity/food.entity";
import { Consumption } from "./src/entity/consumption.entity";

export const myDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "calories_calculator",
  entities: [User, Token, Food, Consumption],
  logging: true,
  synchronize: false,
});
