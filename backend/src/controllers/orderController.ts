import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { IOrderRequestBody } from '../types/order';
import Product from '../models/Product';

export const createOrder = async (
  req: Request<{}, {}, IOrderRequestBody>,
  res: Response,
) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    // Проверяем наличие обязательных полей
    if (!payment || !email || !phone || !address || !total || !items?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Проверяем корректный выбор платежного способа
    if (!['card', 'online'].includes(payment)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Проверяем, что все товары существуют и у них есть цена
    const products = await Product.find({ _id: { $in: items } });
    if (products.length !== items.length) {
      return res
        .status(400)
        .json({ message: 'One or more products not found' });
    }

    const totalFromDB = products.reduce((sum, p) => sum + (p.price ?? 0), 0);
    if (totalFromDB !== total) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    // Генерируем ID заказа
    const orderId = faker.string.uuid();

    return res.status(201).json({
      id: orderId,
      total,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
