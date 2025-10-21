import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { errors as celebrateErrors } from "celebrate";
import connectDB from "./config/db";
import productRoutes from "./routes/product";
import orderRoutes from "./routes/order";
import authRoutes from "./routes/auth";
import errorHandler from "./middlewares/errorHandler";
import { requestLogger, errorLogger } from "./middlewares/logger";

const app = express();

const PORT = process.env.PORT || 3000;
const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW || "*";

app.use(
  cors({
    origin: ORIGIN_ALLOW,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

connectDB().catch((error) => {
  console.error("MongoDB connection failed:", error);
  process.exit(1);
});

app.use(requestLogger);

app.use("/product", productRoutes);
app.use("/order", orderRoutes);
app.use("/auth", authRoutes);

app.use(errorLogger);
app.use(celebrateErrors());
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
