import winston from 'winston';
import expressWinston from 'express-winston';

// Логирование всех входящих запросов
export const requestLogger = expressWinston.logger({
  transports: [new winston.transports.File({ filename: 'request.log' })],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
});

// Логирование ошибок
export const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.File({ filename: 'error.log' })],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});
