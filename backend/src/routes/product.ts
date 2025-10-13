import { Router } from 'express';
import {
  getAllProducts,
  createProduct,
} from '../controllers/productController';
import { validateCreateProduct } from '../middlewares/validate';

const router = Router();

router.get('/', getAllProducts);
router.post('/', validateCreateProduct, createProduct);

export default router;
