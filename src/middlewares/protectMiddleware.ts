import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { promisify } from 'util';
import { checkJwtSecret } from '../utils/getJWTSecretFromEnv';
import { Payload } from '@prisma/client/runtime/library';
import { exclude } from '../validators/returnUserValidation';

interface CustomRequest extends Request {
  user?: Partial<User>;
}

const prisma = new PrismaClient();

export const protect = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token)
      return next(
        new AppError('This is protected route. Must have login', 401)
      );

    // must declare generics that have been passed for promisified function
    const decoded: Payload<string> = await promisify<string, string>(
      jwt.verify
    )(token as string, checkJwtSecret() as string);

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!currentUser) {
      return next(
        new AppError(
          'The user blonging to this token does not no longer exist.',
          401
        )
      );
    }
    const userWithoutPassword = exclude(currentUser, ['password', 'phone']);
    req.user = userWithoutPassword;
    console.log(req.user);
    next();
  }
);
