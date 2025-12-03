import express from 'express'
import http from 'http'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import compression from "compression";

import { initDatabase } from './config/initDatabase.js'
import postRoutes from './routes/postRoutes.js'
import authRoutes from './routes/authRoutes.js'
import storyRoutes from './routes/storyRoutes.js'
import messagesRoutes from './routes/messagesRoutes.js'
import rateLimit from 'express-rate-limit'
import userRoutes from './routes/userRoutes.js'
import followersRoutes from './routes/followRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const { CLIENT_URL, SERVER_URL } = process.env


const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
})

app.set('io', io)

const PORT = process.env.PORT || 3000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(compression());
app.use(express.json())
app.use(helmet())
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser())

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: 'Too many requests, try again later.',
})

app.use(limiter)
app.use('/api/posts', postRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/story', storyRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/users', userRoutes)
app.use('/api/follow', followersRoutes)
app.use('/api/notifications', notificationRoutes)

io.on('connection', socket => {
  socket.on('joinUserRoom', userId => {
    socket.join(`user_${userId}`)
  })

  socket.on('joinConversation', conversationId => {
    socket.join(`conversation_${conversationId}`)
  })

  socket.on('sendMessage', ({ conversationId, message, senderId }) => {
    socket.to(`conversation_${conversationId}`).emit('receiveMessage', {
      conversationId,
      message,
      senderId,
      created_at: new Date(),
    })
    io.emit('conversationUpdate', {
      conversationId,
      lastMessage: message,
      senderId,
      created_at: new Date(),
    })
  })
  socket.on('markSeen', ({ conversationId, userId }) => {
    if (!conversationId || !userId) return
    socket.to(`conversation_${conversationId}`).emit('markSeen', { conversationId, userId })
  })
  socket.on('isTyping', ({ conversationId, userId }) => {
    if (!conversationId || !userId) return
    socket.to(`conversation_${conversationId}`).emit('isTyping', { conversationId, userId })
  })
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id)
  })
})

initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server started succesfully!`)
  })
})
