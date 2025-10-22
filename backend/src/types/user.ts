import { IToken } from './token';

export interface IUser {
  name?: string,
  email: string,
  password: string,
  tokens: IToken[];
}