import express from 'express';
import { protect } from '../middlewares/protectMiddleware';
import {
  createComment,
  deleteComment,
  getAllComments,
  getAllPostComments,
  updateComment,
} from '../controllers/commentController';

export const commentRouter = express.Router();

commentRouter.use(protect);

commentRouter.route('/').post(createComment).get(getAllComments);

commentRouter.route('/:id').delete(deleteComment).patch(updateComment);

commentRouter.route('/:postId').get(getAllPostComments);
