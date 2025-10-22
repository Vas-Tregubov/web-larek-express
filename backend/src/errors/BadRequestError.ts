import AppError from './AppError';

class BadRequestError extends AppError {
  constructor(message = 'Invalid request data') {
    super(message, 400);
  }
}

export default BadRequestError;
