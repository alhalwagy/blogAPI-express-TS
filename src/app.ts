import express, { Express } from 'express';
import { appRouter } from './routes';
import morgan from 'morgan';
import errorController from './controllers/errorController';
import { AppError } from './utils/AppError';

export const app: Express = express();

app.use(express.json());

app.use(morgan('dev'));

appRouter(app);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});

app.use(errorController);
