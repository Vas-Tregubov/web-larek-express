import { Router } from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { validateCreateProduct } from "../middlewares/validate";

const router = Router();

router.get("/", getAllProducts);
router.post("/", validateCreateProduct, createProduct);
router.patch("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

export default router;
