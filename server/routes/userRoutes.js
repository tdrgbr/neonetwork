import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  getUserFollowers,
  getUserFollowing,
  updateUserType,
  updatePassword,
  updateEmail,
  updateUsername,
  getUserIdProfile,
  getUserRequests,
  getUserRequesting,
  updateAvatar,
  searchUser,
  getDiscover,
} from '../controllers/userController.js'

const router = express.Router()

router.get('/search', authMiddleware, searchUser)
router.get('/discover', authMiddleware, getDiscover)
router.put('/', authMiddleware, updateUserProfile)
router.post('/updatestatus', authMiddleware, updateUserType)
router.post('/updatepassword', authMiddleware, updatePassword)
router.post('/updatemail', authMiddleware, updateEmail)
router.post('/updateusername', authMiddleware, updateUsername)
router.post('/avatar', authMiddleware, updateAvatar)

router.get('/:username', authMiddleware, getUserProfile)
router.get('/:id', authMiddleware, getUserIdProfile)
router.get('/:username/posts', authMiddleware, getUserPosts)
router.get('/:username/followers', authMiddleware, getUserFollowers)
router.get('/:username/requests', authMiddleware, getUserRequests)
router.get('/:username/requesting', authMiddleware, getUserRequesting)
router.get('/:username/following', authMiddleware, getUserFollowing)

export default router
