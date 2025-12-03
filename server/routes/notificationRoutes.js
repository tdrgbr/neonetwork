import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { getNotifications } from '../controllers/notificationController.js'

const router = express.Router()

router.get('/', authMiddleware, getNotifications)

export default router
