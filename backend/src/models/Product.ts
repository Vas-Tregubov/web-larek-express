import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../types/product';

export interface IProductDocument extends IProduct, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    title: {
      type: String,
      required: [true, 'Поле "title" должно быть заполнено'],
      unique: true,
      minlength: [2, 'Минимальная длина поля "title" - 2'],
      maxlength: [30, 'Максимальная длина поля "title" - 30'],
      trim: true,
    },
    image: {
      fileName: {
        type: String,
        required: [true, 'Поле "fileName" должно быть заполнено'],
      },
      originalName: {
        type: String,
        required: [true, 'Поле "originalName" должно быть заполнено'],
      },
    },
    category: {
      type: String,
      required: [true, 'Поле "category" должно быть заполнено'],
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IProductDocument>('product', productSchema);
