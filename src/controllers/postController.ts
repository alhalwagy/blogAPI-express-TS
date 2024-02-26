import { Prisma, PrismaClient, User } from '@prisma/client';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '../utils/interfaces/CustomRequest';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { createPostValidation } from '../validators/postValidation';
import path from 'path';
import { cloudinaryUploadImage } from '../utils/cloudinaryImage';
import fs from 'fs';

const prisma = new PrismaClient();

export const createPost = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    console.log(req.body);

    const { error } = createPostValidation(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { title, content, categoryIds } = req.body;
    const categoryids: number[] = JSON.parse(categoryIds);

    const existingCategories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryids,
        },
      },
    });

    // Verify if all provided category IDs exist in the database
    if (
      existingCategories.length !== categoryids.length ||
      categoryids.length === 0
    ) {
      return next(new AppError('One or more category IDs do not exist.', 400));
    }

    let result;
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        `../../images/${req.file.filename}`
      );
      console.log(imagePath);
      result = await cloudinaryUploadImage(imagePath);

      fs.unlinkSync(imagePath);
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        image: result ? result.secure_url : null,
        imageId: result ? result.public_id : null,
        writerId: (req.user as User).id,
        category: {
          connect: categoryids.map((categoryId) => ({ id: categoryId })),
        },
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        post,
      },
    });
  }
);

export const getAllPosts = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, category } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let postsQuery: any = {
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: Prisma.SortOrder.desc },
      include: {
        writer: {
          select: { email: true, userName: true, image: true, id: true },
        },

        userLikedPost: {
          select: {
            userId: true,
          },
        },
        comment: true,
        category: true,
      },
    };
    if (category) {
      const categ = await prisma.category.findUnique({
        where: { name: category as string },
      });
      if (categ) {
        postsQuery.where = {
          category: { some: { id: categ!.id } },
        };
      }
    }

    const posts = await prisma.post.findMany(postsQuery);

    res.status(200).json({
      status: 'success',
      result: posts.length,
      data: posts,
    });
  }
);

export const getPost = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        writer: {
          select: {
            id: true,
            userName: true,
            email: true,
            image: true,
          },
        },
        userLikedPost: {
          select: {
            userId: true,
          },
        },
        comment: true,
      },
    });

    if (!post) return next(new AppError('post Not found', 404));
    res.status(201).json({ post });
  }
);

export const updatePost = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {}
);

export const deletePost = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {}
);
