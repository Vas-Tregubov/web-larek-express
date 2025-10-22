import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File not provided" });
    }

    const targetDir = path.join(__dirname, "../../public/images");
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const targetPath = path.join(targetDir, req.file.filename);
    fs.renameSync(req.file.path, targetPath);

    res.status(200).json({
      fileName: `/images/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (err) {
    next(err);
  }
};
