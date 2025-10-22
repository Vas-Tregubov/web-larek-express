import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User";
import BadRequestError from "../errors/BadRequestError";
import ConflictError from "../errors/ConflictError";
import UnauthorizedError from "../errors/UnauthorizedError";
import NotFoundError from "../errors/NotFoundError";

const ACCESS_EXPIRES = process.env.AUTH_ACCESS_TOKEN_EXPIRY!;
const REFRESH_EXPIRES = process.env.AUTH_REFRESH_TOKEN_EXPIRY!;
const ACCESS_SECRET = process.env.AUTH_ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.AUTH_REFRESH_TOKEN_SECRET!;

function signAccessToken(payload: object): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as SignOptions);
}

function signRefreshToken(payload: object): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as SignOptions);
}

const getMaxAge = (expiry: string): number => {
  const match = expiry.match(/^(\d+)([dhm])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

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

// ================= REGISTER =================
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return next(new BadRequestError('user validation failed: email: Поле "email" должно быть заполнено'));
    }

    const existingUser = await User.findOne({ email }).select("+tokens");
    if (existingUser) return next(new ConflictError("Пользователь с таким email уже существует"));

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, tokens: [] });

    const payload = { _id: user._id };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.tokens.push({ token: refreshToken });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: getMaxAge(REFRESH_EXPIRES),
    });

    res.status(201).json({
      success: true,
      user: { name: user.name, email: user.email, id: user._id },
      accessToken,
    });
  } catch (error: any) {
    next(error);
  }
};

// ================= LOGIN =================
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new BadRequestError("Не все поля заполнены"));

    const user = await User.findOne({ email }).select("+password +tokens");
    if (!user) return next(new UnauthorizedError("Неправильные почта или пароль"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new UnauthorizedError("Неправильные почта или пароль"));

    const payload = { _id: user._id };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.tokens.push({ token: refreshToken });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: getMaxAge(REFRESH_EXPIRES),
    });

    res.status(200).json({
      success: true,
      user: { name: user.name, email: user.email },
      accessToken,
    });
  } catch (error: any) {
    next(error);
  }
};

// ================= GET CURRENT USER =================
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next(new UnauthorizedError("Необходима авторизация // Истек срок действия токена"));

    const token = authHeader.replace("Bearer ", "");
    const decoded: any = jwt.verify(token, ACCESS_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) return next(new NotFoundError("Пользователь по заданному id отсутствует в базе"));

    res.status(200).json({
      success: true,
      user: { name: user.name, email: user.email, id: user._id },
    });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Invalid or expired token"));
    }
    next(error);
  }
};

// ================= LOGOUT =================
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) return next(new BadRequestError("No token provided"));

    const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findById(decoded._id).select("+tokens");
    if (!user) return next(new NotFoundError("User not found"));

    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    await user.save();

    res.cookie("refreshToken", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    res.json({ success: true });
  } catch (err: any) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Invalid or expired token"));
    }
    next(err);
  }
};

// ================= REFRESH ACCESS TOKEN =================
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) return next(new UnauthorizedError("No token provided"));

    const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findById(decoded._id).select("+tokens");
    if (!user) return next(new NotFoundError("User not found"));

    const tokenExists = user.tokens.some((t) => t.token === refreshToken);
    if (!tokenExists) return next(new UnauthorizedError("Token revoked"));

    const payload = { _id: user._id };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    user.tokens.push({ token: newRefreshToken });
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: getMaxAge(REFRESH_EXPIRES),
    });

    res.json({
      success: true,
      user: { name: user.name, email: user.email },
      accessToken: newAccessToken,
    });
  } catch (err: any) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Не валидный токен"));
    }
    next(err);
  }
};
