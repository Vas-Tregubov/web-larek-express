import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UnauthorizedError from "../errors/UnauthorizedError";

const ACCESS_SECRET = process.env.AUTH_ACCESS_TOKEN_SECRET!;

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new UnauthorizedError("Необходима авторизация"));
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, ACCESS_SECRET);

    (req as any).user = decoded;

    next();
  } catch (error: any) {
    return next(new UnauthorizedError("Недействительный или просроченный токен"));
  }
};
