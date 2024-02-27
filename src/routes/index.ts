import { authRouter } from './authRoute';
import { userRouter } from './userRoute';
import { postRouter } from './postRoutes';
import { catrgoryRouter } from './categoryRoutes';
import { commentRouter } from './commentRoutes';
import { likeRouter } from './likerRoutes';

export const appRouter = (app: any) => {
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/posts', postRouter);
  app.use('/api/v1/categories', catrgoryRouter);
  app.use('/api/v1/comments', commentRouter);
  app.use('/api/v1/likes', likeRouter);
};
