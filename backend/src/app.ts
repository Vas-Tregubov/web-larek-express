import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import errorHandler from './middlewares/errorHandler';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW || '*';

app.use(
  cors({
    origin: ORIGIN_ALLOW,
  }),
);
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

connectDB().catch((error) => {
  console.error('MongoDB connection failed:', error);
  process.exit(1);
});

app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
