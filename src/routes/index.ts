import express from 'express';
import { authRouter } from './authRoute';
import { userRouter } from './userRoute';

export const appRouter = (app: any) => {
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
};
