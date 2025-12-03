import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  createConversation,
  sendMessage,
  getConversations,
  getMessages,
  getUnreadMessages,
  markConversationAsSeen,
  getConversationParticipant,
} from '../controllers/messagesController.js'

const router = express.Router()

router.post('/conversation', authMiddleware, createConversation)
router.post('/message', authMiddleware, sendMessage)
router.get('/conversations', authMiddleware, getConversations)
router.get('/:id', authMiddleware, getMessages)
router.get('/unread', authMiddleware, getUnreadMessages)
router.post('/:conversationId/seen', authMiddleware, markConversationAsSeen)
router.get('/conversation/:conversationId', authMiddleware, getConversationParticipant)

export default router
