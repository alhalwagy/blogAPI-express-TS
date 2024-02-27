import { Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';

import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { CustomRequest } from '../utils/interfaces/CustomRequest';

const prisma = new PrismaClient();

export const toggleLike = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const postId = parseInt(req.params.postId);

    const like = await prisma.like.findFirst({
      where: {
        userId: (req.user as User).id,
        postId,
      },
    });

    if (like) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: (req.user as User).id,
            postId,
          },
        },
      });

      res.status(200).json({ status: 'unLiked' });
    } else {
      await prisma.like.create({
        data: {
          userId: (req.user as User).id,
          postId,
        },
      });
      res.status(200).json({ status: 'Liked' });
    }
  }
);

export const getAllLikes = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const postId = parseInt(req.params.postId);
    const likes = await prisma.like.findMany({
      where: {
        postId,
      },
      select: {
        userId: true,
        user: true,
      },
    });
    res.status(200).json({ likes });
  }
);
