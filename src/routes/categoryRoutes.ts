import express from 'express';
import { protect } from '../middlewares/protectMiddleware';
import { restrictToAdmin } from '../middlewares/authorizationMiddleware';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from '../controllers/categoryRoutes';

export const catrgoryRouter = express.Router();

catrgoryRouter.use(protect);
// catrgoryRouter.use(restrictToAdmin);
catrgoryRouter.route('/').post(createCategory).get(getAllCategories);

catrgoryRouter
  .route('/:id')
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);
