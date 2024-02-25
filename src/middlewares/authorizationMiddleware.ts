import { User } from '@prisma/client';
import { CustomRequest } from '../utils/interfaces/CustomRequest';
import { NextFunction, Response } from 'express';
import { AppError } from '../utils/AppError';

export const restrictToAdmin = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return next(
      new AppError('You do not have the permission to perform that action', 403)
    );
  }

  next();
};
