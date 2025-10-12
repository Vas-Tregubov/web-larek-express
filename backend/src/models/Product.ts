import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../types/product';

export interface IProductDocument extends IProduct, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 30,
    },
    image: {
      fileName: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        required: true,
      },
    },
    category: {
      type: String,
      required: true,
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
