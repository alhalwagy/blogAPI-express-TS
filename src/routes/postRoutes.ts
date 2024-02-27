import express from 'express';
import { protect } from '../middlewares/protectMiddleware';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  searchPost,
  updateImagePost,
  updatePost,
} from '../controllers/postController';
import { resizePostPhoto, uploadImage } from '../utils/multer';

export const postRouter = express.Router();

postRouter.use(protect);

postRouter
  .route('/')
  .post(uploadImage, resizePostPhoto, createPost)
  .get(getAllPosts);

postRouter.route('/searchposts').get(searchPost);

postRouter
  .route('/updateimagepost/:id/')
  .patch(uploadImage, resizePostPhoto, updateImagePost);

postRouter.route('/:id').get(getPost).patch(updatePost).delete(deletePost);
