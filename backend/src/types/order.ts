export interface IOrderRequestBody {
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
