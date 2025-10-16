import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";
import bcrypt from "bcryptjs";
import User from "../models/User";
import BadRequestError from "../errors/BadRequestError";
import ConflictError from "../errors/ConflictError";

const ACCESS_EXPIRES = process.env.AUTH_ACCESS_TOKEN_EXPIRY!;
const REFRESH_EXPIRES = process.env.AUTH_REFRESH_TOKEN_EXPIRY!;
const ACCESS_SECRET = process.env.AUTH_ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.AUTH_REFRESH_TOKEN_SECRET!;

function signAccessToken(payload: object): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  } as SignOptions);
}

function signRefreshToken(payload: object): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  } as SignOptions);
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError(
        'user validation failed: email: Поле "email" должно быть заполнено',
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("Пользователь с таким email уже существует");
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      tokens: [],
    });

    const payload = { _id: user._id };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.tokens.push({ token: refreshToken });
    await user.save();

    //TODO: убрать этот костыль. Библиотека ms и TS не подружились. Перепробовал все варианты, ошибка не уходит

    const getMaxAge = (expiry: string): number => {
      const match = expiry.match(/^(\d+)([dhm])$/);
      if (!match) return 7 * 24 * 60 * 60 * 1000; // fallback 7 дней

      const [, num, unit] = match;
      const number = parseInt(num);

      switch (unit) {
        case "d":
          return number * 24 * 60 * 60 * 1000;
        case "h":
          return number * 60 * 60 * 1000;
        case "m":
          return number * 60 * 1000;
        default:
          return 7 * 24 * 60 * 60 * 1000;
      }
    };

    const maxAge = getMaxAge(REFRESH_EXPIRES);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge,
      path: "/",
    });

    res.status(201).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
      },
      accessToken,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      next(new BadRequestError("Validation error"));
      return;
    }
    next(error);
  }
};
