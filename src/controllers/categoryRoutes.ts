import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { createCategoryValidation } from '../validators/categoryValidation';

const prisma = new PrismaClient();

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = createCategoryValidation(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const { name } = req.body;

    const category = await prisma.category.upsert({
      where: { name },
      create: {
        name,
      },
      update: {
        name,
      },
    });

    res.status(200).json({
      message: 'category added successfuly.',
      data: {
        category,
      },
    });
  }
);
