import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { IOrderRequestBody } from '../types/order';
import Product from '../models/Product';
import BadRequestError from '../errors/BadRequestError';

export const createOrder = async (
  req: Request<{}, {}, IOrderRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    // Проверяем наличие обязательных полей
    if (!payment || !email || !phone || !address || !total || !items?.length) {
      return next(new BadRequestError('Не все обязательные поля заполнены'));
    }

    // Проверяем корректный выбор платежного способа
    if (!['card', 'online'].includes(payment)) {
      return next(new BadRequestError('Неверный способ оплаты'));
    }

    // Проверяем, что все товары существуют и у них есть цена
    const products = await Product.find({ _id: { $in: items } });
    if (products.length !== items.length) {
      return next(new BadRequestError(`Товар с id ${items[0]} не найден`));
    }

    const totalFromDB = products.reduce((sum, p) => sum + (p.price ?? 0), 0);
    if (totalFromDB !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    // Генерируем ID заказа
    const orderId = faker.string.uuid();

    return res.status(201).json({
      id: orderId,
      total,
    });
  } catch (error) {
    next(error);
  }
};
