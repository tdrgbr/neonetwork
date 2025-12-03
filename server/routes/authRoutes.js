import express from 'express'
import {
  addUser,
  loginUser,
  logoutUser,
  refreshToken,
  getCurrentUser,
} from '../controllers/authController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/create', addUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/refresh', refreshToken)
router.get('/me', authMiddleware, getCurrentUser)

export default router
