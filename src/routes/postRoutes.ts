import express from 'express';
import { protect } from '../middlewares/protectMiddleware';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
} from '../controllers/postController';
import { resizePostPhoto, uploadImage } from '../utils/multer';

export const postRouter = express.Router();

postRouter.use(protect);

postRouter
  .route('/')
  .post(uploadImage, resizePostPhoto, createPost)
  .get(getAllPosts);

postRouter.route('/:id').get(getPost).patch(updatePost).delete(deletePost);
