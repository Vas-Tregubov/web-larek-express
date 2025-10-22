import { NextFunction, Request, Response } from "express";
import Product, { IProductDocument } from "../models/Product";
import { IProduct } from "../types/product";
import BadRequestError from "../errors/BadRequestError";
import ConflictError from "../errors/ConflictError";
import NotFoundError from "../errors/NotFoundError";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products: IProductDocument[] = await Product.find();
    res.status(200).json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productData: IProduct = req.body;

    if (!productData.title || !productData.image) {
      return next(new BadRequestError("Product title and image are required"));
    }
    const newProduct: IProductDocument = await Product.create(productData);
    res.status(201).json(newProduct);
  } catch (error: any) {
    // Ошибка уникального поля
    if (error.code === 11000) {
      return next(new ConflictError("Product title already exists"));
    }
    // Ошибка валидации mongoose
    if (error.name === "ValidationError") {
      return next(new BadRequestError(error.message));
    }
    // Любая другая ошибка
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const updates: Partial<IProduct> = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return next(new NotFoundError("Товар не найден"));
    }

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return next(new BadRequestError(error.message));
    }
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return next(new NotFoundError("Товар не найден"));
    }

    res.status(200).json(deletedProduct);
  } catch (error: any) {
    next(error);
  }
};
