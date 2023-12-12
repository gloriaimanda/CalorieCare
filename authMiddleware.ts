// src/authMiddleware.ts
import { myDataSource } from "./app-data-source";
import { Token } from "./src/entity/token.entity";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const tokenData = await myDataSource.getRepository(Token).findOne({ where: { token } });
  if (!tokenData || tokenData["is_logout"]) {
    return res.status(403).json({ message: "You are already logout" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req["user"] = user;
    next();
  });
};
