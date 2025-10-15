import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IToken } from '../types/token';
import { IUser } from '../types/user';

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: [true, 'Поле "token" должно быть заполнено'],
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина поля "name" — 2'],
      maxlength: [30, 'Максимальная длина поля "name" — 30'],
      default: 'Ё-мое',
    },
    email: {
      type: String,
      required: [true, 'Поле "email" должно быть заполнено'],
      unique: true,
      validate: {
        validator(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Некорректный формат email',
      },
    },
    password: {
      type: String,
      required: [true, 'Поле "password" должно быть заполнено'],
      minlength: [6, 'Минимальная длина поля "password" — 6'],
      select: false, // не возвращаем хеш по умолчанию
    },
    tokens: {
      type: [tokenSchema],
      default: [],
      select: false, // не возвращаем refresh-токены
    },
  },
  {
    timestamps: true,
  },
);

// Сравниваем пароль по хэшу
userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserDocument>('user', userSchema);