import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  getPost,
  getFeed,
  addPost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  getUserPosts,
} from '../controllers/postController.js'

const router = express.Router()

router.get('/feed', authMiddleware, getFeed)
router.get('/:postId', authMiddleware, getPost)
router.get('/user/:userId', authMiddleware, getUserPosts)
router.post('/add', authMiddleware, addPost)
router.delete('/del/:id', authMiddleware, deletePost)
router.post('/:id/like', authMiddleware, likePost)
router.post('/:postId/comment', authMiddleware, addComment)
router.delete('/comment/:id', authMiddleware, deleteComment)

export default router
