import { Router } from "express";
import fileMiddleware from "../middlewares/file";
import { uploadFile } from "../controllers/upload";

const router = Router();

router.post("/", fileMiddleware.single("file"), uploadFile);

export default router;