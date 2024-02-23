import { User } from '@prisma/client';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { exclude } from '../validators/returnUserValidation';

const signToken = (id: number): string => {
  if (!process.env.JWT_SECRET) {
    console.log('Missing jwt secret');
    process.exit(1);
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const createSendToken = (
  user: User,
  statusCode: number,
  res: Response
) => {
  const token: string = signToken(user.id);

  const excludedUser = exclude(user, ['password']);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      excludedUser,
    },
  });
};
