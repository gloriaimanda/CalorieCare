import * as express from "express";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { myDataSource } from "./app-data-source";
import { User } from "./src/entity/user.entity";
import * as jwt from "jsonwebtoken";
import { Token } from "./src/entity/token.entity";
import { authenticateJWT } from "./authMiddleware";
import { Food } from "./src/entity/food.entity";
import { Consumption } from "./src/entity/consumption.entity";

dotenv.config();
myDataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

const app = express();
app.use(express.json());

app.post("/register", async function (req: Request, res: Response) {
  const { name, email, password } = req.body;
  const user = new User();
  user.name = name;
  user.email = email;
  user.password = password;
  await myDataSource.getRepository(User).save(user);
  const token = jwt.sign({ userID: user.id, nameID: user.id }, process.env.SECRET_KEY, { expiresIn: "1h" });
  const tokenSave = new Token();
  tokenSave.token = token;
  await myDataSource.getRepository(Token).save(tokenSave);
  res.send({ message: "User Berhasil Register", token });
});

app.post("/Login", async function (req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await myDataSource.getRepository(User).findOne({ where: { email } });
  if (!user || user.password != password) {
    res.status(401).send({ Message: "Invalid email or password" });
    return;
  }
  const token = await jwt.sign({ userID: user.id, nameID: user.id }, process.env.SECRET_KEY, { expiresIn: "1h" });
  const tokenSave = new Token();
  tokenSave.token = token;
  await myDataSource.getRepository(Token).save(tokenSave);
  res.send({ message: "User Login Succesfully", token });
});

app.post("/logout", authenticateJWT, async function (req: Request, res: Response) {
  const token = req.header("Authorization")?.split(" ")[1];
  const logoutStatus = await myDataSource.getRepository(Token).findOne({ where: { token } });
  await myDataSource.getRepository(Token).update(logoutStatus.id, { is_logout: true });
  res.send({ message: "Logout Successfully" });
});

app.get("/food", authenticateJWT, async function (req: Request, res: Response) {
  const data = await myDataSource.getRepository(Food).find();
  res.send(data);
});

app.post("/consumption", authenticateJWT, async function (req: Request, res: Response) {
  const { food_id } = req.body;
  const user_id = req["user"].userID;
  const data = new Consumption();
  data.food = food_id;
  data.user = user_id;
  await myDataSource.getRepository(Consumption).save(data);
  res.send({ message: "Data berhasil disimpan" });
});

app.get("/consumptions", authenticateJWT, async function (req: Request, res: Response) {
  const user_id = req["user"].userId;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");

  const data = await myDataSource
    .getRepository(Consumption)
    .createQueryBuilder("consumptions")
    .leftJoinAndSelect("consumptions.food", "food")
    .where("consumptions.user_id = :user_id", { user_id })
    .andWhere("YEAR(consumptions.created_at) = :year", { year })
    .andWhere("MONTH(consumptions.created_at) = :month", { month })
    .andWhere("DAY(consumptions.created_at) = :day", { day })
    .getMany();
  res.send({ data });
});

app.get("/summary", authenticateJWT, async function (req: Request, res: Response) {
  const user_id = req["user"].userId;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");

  const data = await myDataSource
    .getRepository(Consumption)
    .createQueryBuilder("consumptions")
    .addSelect("SUM(food.calories")
    .leftJoin("consumptions.food", "food")
    .where("consumptions.user_id = :user_id", { user_id })
    .andWhere("YEAR(consumptions.created_at) = :year", { year })
    .andWhere("MONTH(consumptions.created_at) = :month", { month })
    .andWhere("DAY(consumptions.created_at) = :day", { day })
    .getMany();
  res.send({ data });
});

app.delete("/consumption", authenticateJWT, async function (req: Request, res: Response) {
  const { id } = req.body;
  const user_id = req["user"].userID;
  const data = await myDataSource.getRepository(Consumption).findOne({ where: { id, user: { id: user_id } } });
  if (!data) {
    res.status(404).send({ message: "Data Not Found" });
    return;
  }
  await myDataSource.getRepository(Consumption).remove(data);
  res.send({ message: "Data deleted successfully" });
});

app.listen(process.env.PORT, (): void => {
  console.log(`server udah jalan ${process.env.PORT}`);
});
