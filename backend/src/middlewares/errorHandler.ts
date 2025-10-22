import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/AppError';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('❌ Error caught by middleware:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Ошибки MongoDB
  if (err instanceof Error && err.message.includes('E11000')) {
    return res
      .status(409)
      .json({ message: 'Product with this title already exists' });
  }

  // Ошибка по умолчанию
  res.status(500).json({ message: 'Internal server error' });
};

export default errorHandler;
