import { Request, Response } from 'express';
import Product, { IProductDocument } from '../models/Product';
import { IProduct } from '../types/product';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products: IProductDocument[] = await Product.find();
    res.status(200).json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData: IProduct = req.body;
    const newProduct: IProductDocument = await Product.create(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: 'Failed to create product', error });
  }
};
