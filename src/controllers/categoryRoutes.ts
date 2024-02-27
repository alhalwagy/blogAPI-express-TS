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

export const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await prisma.category.findMany({});

    if (categories.length === 0) {
      return next(new AppError('no categories found.', 404));
    }

    res.status(200).json({
      status: 'success',
      daa: {
        categories,
      },
    });
  }
);

export const getCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) return next(new AppError('cayegory not found.', 404));

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  }
);

export const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) return next(new AppError('category not found', 404));

    const { error } = createCategoryValidation(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: req.body.name,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        updatedCategory,
      },
    });
  }
);

export const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) return next(new AppError('category not found.', 404));

    await prisma.category.delete({ where: { id } });

    res.status(204).json({});
  }
);
