import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  acceptRequest,
  declineRequest,
  followUser,
  requestFollow,
} from '../controllers/followController.js'

const router = express.Router()

router.post('/:id', authMiddleware, followUser)
router.post('/request/:id', authMiddleware, requestFollow)
router.post('/request/:id/accept', authMiddleware, acceptRequest)
router.post('/request/:id/decline', authMiddleware, declineRequest)

export default router
