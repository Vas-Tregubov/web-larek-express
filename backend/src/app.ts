import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

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

connectDB().catch((error) => {
  console.error('MongoDB connection failed:', error);
  process.exit(1);
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
