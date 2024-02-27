import express from 'express';
import { getAllLikes, toggleLike } from '../controllers/likeController';

export const likeRouter = express.Router();

likeRouter.route('/:postId').post(toggleLike).get(getAllLikes);
