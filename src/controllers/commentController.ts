import { PrismaClient, User } from '@prisma/client';
import { Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { CustomRequest } from '../utils/interfaces/CustomRequest';
import { validateCreateComment } from '../validators/commentValidation';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const createComment = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { error } = validateCreateComment(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { postId, content } = req.body;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return next(new AppError('no post found.', 404));

    const newComment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: (req.user as User).id,
      },
    });

    res.status(200).json({
      message: 'comment created successfully',
      newComment,
    });
  }
);

//For ADMINS only
export const getAllComments = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            image: true,
            isAdmin: true,
            isVerified: true,
          },
        },
      },
    });
    res.status(200).json(comments);
  }
);

// for ADMINS and Owener
export const deleteComment = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: {
        id,
      },
    });
    if (!comment) return next(new AppError('Comment not found', 404));

    if (req.user?.isAdmin || comment.userId === req.user?.id) {
      await prisma.comment.delete({
        where: { id },
      });

      res.status(200).json({ message: 'comment deleted' });
    } else {
      next(new AppError('access denied, forbidden', 403));
    }
  }
);

export const updateComment = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { error } = validateCreateComment(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const id = parseInt(req.params.id);
    const { content } = req.body;
    const comment = await prisma.comment.findUnique({
      where: {
        id,
      },
    });

    if (!comment) return next(new AppError('Comment not found', 404));

    if (req.user?.id !== comment?.userId) {
      return next(new AppError('access denied, forbidden', 403));
    }
    const updComment = await prisma.comment.update({
      where: { id },
      data: { content },
    });
    res.status(200).json({
      message: 'comment updated successfully',
      updComment,
    });
  }
);

export const getAllPostComments = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const postId = parseInt(req.params.postId);
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!post) {
      next(new AppError('Post not found', 404));
    }
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
    });
    res.status(200).json({ comments });
  }
);
