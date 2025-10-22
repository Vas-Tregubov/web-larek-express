import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
  logout,
  refreshAccessToken,
} from "../controllers/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", getCurrentUser);
router.get("/logout", logout);
router.get("/token", refreshAccessToken);

export default router;
