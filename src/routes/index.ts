import express from 'express';
import { authRouter } from './authRoute';

export const appRouter = (app: any) => {
  app.use('/api/v1/auth', authRouter);
};
