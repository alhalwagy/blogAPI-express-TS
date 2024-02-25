import { User } from '@prisma/client';
import { Request } from 'express';

export interface CustomRequest extends Request {
  user?: Partial<User>;
  file?: any;
}
