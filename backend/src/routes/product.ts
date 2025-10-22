import { Router } from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { validateCreateProduct } from "../middlewares/validate";
import { auth } from "../middlewares/auth";

const router = Router();

router.get("/", getAllProducts);
router.post("/", auth, validateCreateProduct, createProduct);
router.patch("/:productId", auth, updateProduct);
router.delete("/:productId", auth, deleteProduct);

export default router;
