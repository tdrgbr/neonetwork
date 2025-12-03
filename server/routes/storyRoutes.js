import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  addStory,
  getUserStory,
  getStories,
  deleteStory,
  likeStory,
  viewStory,
  getStoryStats,
} from '../controllers/storyController.js'

const router = express.Router()

router.get('/stats', authMiddleware, getStoryStats)
router.get('/feed', authMiddleware, getStories)
router.get('/:id', authMiddleware, getUserStory)
router.post('/add', authMiddleware, addStory)
router.delete('/del/:id', authMiddleware, deleteStory)
router.post('/:id/like', authMiddleware, likeStory)
router.post('/:id/view', authMiddleware, viewStory)

export default router
