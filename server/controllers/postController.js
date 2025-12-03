import { sql } from '../config/db.js'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import multer from 'multer'
import { sendNotification } from './notificationController.js'
import axios from 'axios'

export const getPost = async (req, res) => {
  try {
    const userId = req.user.id
    const postId = parseInt(req.params.postId)

    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' })
    }

    const [post] = await sql`
      SELECT
        p.id,
        p.description,
        p.image,
        p.user_id,
        p.is_public,
        p.created_at,
        u.username,
        u.avatar,
        COUNT(DISTINCT pl.id) AS likes_count,
        COUNT(DISTINCT pc.id) AS comments_count,
        BOOL_OR(pl.user_id = ${userId}) AS liked_by_me
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN posts_likes pl ON pl.post_id = p.id
      LEFT JOIN post_comments pc ON pc.post_id = p.id
      WHERE p.id = ${postId} AND p.is_public = TRUE
      GROUP BY p.id, u.id;
    `

    if (!post) {
      return res.status(404).json({ message: 'Post not found or private' })
    }

    const comments = await sql`
      SELECT
        pc.id,
        pc.comment,
        pc.created_at,
        u.username,
        u.avatar
      FROM post_comments pc
      JOIN users u ON u.id = pc.user_id
      WHERE pc.post_id = ${postId}
      ORDER BY pc.created_at ASC;
    `

    const postWithComments = { ...post, comments }

    res.json(postWithComments)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

const supabaseUrl = 'https://quiaujirnssmcevuvdsp.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype)
    if (!ok) return cb(new Error('Invalid file type. Only JPG, PNG, and WebP allowed.'))
    cb(null, true)
  },
})

const toBool = v => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return ['true', '1', 'on', 'yes'].includes(v.toLowerCase())
  return true
}
const HIVE_SECRET_KEY = process.env.HIVE_SECRET_KEY
const HIVE_THRESHOLD = Number(process.env.HIVE_THRESHOLD ?? 0.5)

async function hiveModerateBuffer(buffer) {
  const res = await axios.post(
    'https://api.thehive.ai/api/v3/hive/visual-moderation',
    {
      input: [
        {
          media_base64: buffer,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${HIVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return res.data
}
function hiveIsNSFW(hiveResult, threshold = HIVE_THRESHOLD) {
  const classes = hiveResult?.[0]?.classes || []
  const score = label => classes.find(c => c.class === label)?.score ?? 0

  const porn = score('porn')
  const nudity = score('nudity')
  const sexual = score('sexual_activity')
  const suggestive = score('suggestive')
  const minors = score('minors')

  if (minors > 0.2) return true

  return porn > threshold || nudity > threshold || sexual > threshold || suggestive > threshold
}

function extFromType(mimetype) {
  if (!mimetype) return 'jpg'
  if (mimetype.includes('jpeg')) return 'jpg'
  if (mimetype.includes('png')) return 'png'
  if (mimetype.includes('webp')) return 'webp'
  return 'jpg'
}

export const addPost = async (req, res) => {
  upload.single('photo')(req, res, async err => {
    try {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Max 5MB.' })
        }
        return res.status(400).json({ message: err.message })
      }

      const userId = req.user?.id
      if (!userId) return res.status(401).json({ message: 'Unauthenticated' })

      const is_public = toBool(req.body?.is_public)
      const bucket = process.env.SUPABASE_BUCKET || 'uploads'

      if (!req.file) {
        return res.status(400).json({ message: 'Image is required' })
      }

      const meta = await sharp(req.file.buffer).metadata()
      if ((meta.width ?? 0) < 200 || (meta.height ?? 0) < 200) {
        return res.status(400).json({ message: 'Image is too small.' })
      }
      const base64 = req.file.buffer.toString('base64')
      const hiveResult = await hiveModerateBuffer(base64)

      if (hiveIsNSFW(hiveResult)) {
        return res.status(400).json({ message: 'NSFW content not allowed.' })
      }

      const ext = extFromType(req.file.mimetype)
      const processed = await sharp(req.file.buffer)
        .resize(1080, 1350, { fit: 'cover', withoutEnlargement: true })
        .toBuffer()

      const storagePath = `post-${Date.now()}-${userId}.${ext}`

      const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, processed, {
        contentType: req.file.mimetype,
        upsert: false,
      })

      if (upErr) throw upErr

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(storagePath)

      const { description } = req.body || null
      const cleanDescription = description?.trim() || null

      const result = await sql`
        INSERT INTO posts (description, image, user_id, is_public)
        VALUES (${cleanDescription}, ${publicUrl}, ${userId}, ${is_public ?? true})
        RETURNING id, description, image, user_id, is_public, created_at;
      `

      res.status(201).json(result[0])
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error' })
    }
  })
}

export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const posts = await sql`
    SELECT
      p.id,
      p.description,
      p.image,
      p.user_id,
      p.is_public,
      p.created_at,
      u.username,
      u.avatar,
      COUNT(DISTINCT pl.id)        AS likes_count,
      COUNT(DISTINCT pc.id)        AS comments_count,
      COALESCE(BOOL_OR(pl.user_id = ${userId}), FALSE) AS liked_by_me,
      CASE WHEN f.followerId IS NOT NULL THEN 0 ELSE 1 END AS followed_first
    FROM posts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN followers f   
      ON f.followeeId = p.user_id AND f.followerId = ${userId}
    LEFT JOIN posts_likes pl ON pl.post_id = p.id
    LEFT JOIN post_comments pc ON pc.post_id = p.id
    WHERE p.is_public = TRUE AND u.accounttype = TRUE AND p.user_id <> ${userId}
    GROUP BY p.id, u.id, followed_first
    ORDER BY 
    followed_first ASC,
    p.created_at DESC,
    p.id DESC
    LIMIT ${limit} OFFSET ${offset};

    `

    const postsWithComments = await Promise.all(
      posts.map(async post => {
        const comments = await sql`
          SELECT pc.id, pc.comment, pc.created_at, u.username, u.avatar
          FROM post_comments pc
          JOIN users u ON u.id = pc.user_id
          WHERE pc.post_id = ${post.id}
          ORDER BY pc.created_at ASC
          LIMIT 5;
        `

        return { ...post, comments }
      })
    )

    res.json(postsWithComments)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUserPosts = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const posts = await sql`
      SELECT 
        p.id,
        p.description,
        p.image,
        p.user_id,
        u.username,
        u.avatar,
        p.is_public,
        p.created_at,
        COUNT(DISTINCT pl.id) AS likes_count,
        COUNT(DISTINCT pc.id) AS comments_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN posts_likes pl ON pl.post_id = p.id
      LEFT JOIN post_comments pc ON pc.post_id = p.id
      WHERE p.user_id = ${userId}
      GROUP BY p.id, u.username, u.avatar
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `
    const postIds = posts.map(p => p.id)
    let comments = []

    if (postIds.length > 0) {
      comments = await sql`
        SELECT 
          c.id,
          c.post_id,
          c.comment,
          c.created_at,
          u.username,
          u.avatar
        FROM post_comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.post_id = ANY(${postIds})
        ORDER BY c.created_at ASC;
      `
    }
    const postsWithComments = posts.map(post => ({
      ...post,
      likes_count: Number(post.likes_count),
      comments_count: Number(post.comments_count),
      comments: comments.filter(c => c.post_id === post.id),
    }))

    res.json(postsWithComments)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id)
    const userId = req.user.id

    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post id' })
    }

    const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`

    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.user_id !== userId)
      return res.status(403).json({ message: 'You cannot delete this post' })

    await sql`
      UPDATE posts
      SET is_public = FALSE
      WHERE id = ${postId}
    `

    res.json({ message: 'Post has been set to private' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const likePost = async (req, res) => {
  const userId = req.user.id
  const postId = parseInt(req.params.id)
  const io = req.app.get('io')

  const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`
  if (!post) return res.status(404).json({ message: 'Post not found' })

  const [existing] = await sql`
    SELECT * FROM posts_likes WHERE post_id = ${postId} AND user_id = ${userId}
  `

  if (existing) {
    await sql`
      DELETE FROM posts_likes WHERE post_id = ${postId} AND user_id = ${userId}
    `
    await sql`
      DELETE FROM notifications WHERE sender_id = ${userId} AND post_id = ${postId} AND type = 'like_post'
    `
    return res.status(200).json({ message: 'Post unliked' })
  }

  await sql`
    INSERT INTO posts_likes (post_id, user_id) VALUES (${postId}, ${userId})
  `
  const [notification] = await sql`
    SELECT * FROM notifications WHERE sender_id = ${userId} AND post_id = ${postId} AND type = 'like_post'
  `
  if (notification) {
    await sql`
      DELETE FROM notifications WHERE sender_id = ${userId} AND post_id = ${postId} AND type = 'like_post'
    `
  }
  if (userId !== post.user_id)
    sendNotification({
      userId: post.user_id,
      senderId: userId,
      type: 'like_post',
      postId,
      io,
    })

  res.status(201).json({ message: 'Post liked' })
}
export const addComment = async (req, res) => {
  const userId = req.user.id
  const postId = parseInt(req.params.postId)
  const { comment } = req.body
  const io = req.app.get('io')
  console.log(postId)
  if (!comment || comment.trim() === '')
    return res.status(400).json({ message: 'Comment cannot be empty' })

  const [newComment] = await sql`
    INSERT INTO post_comments (post_id, user_id, comment)
    VALUES (${postId}, ${userId}, ${comment})
    RETURNING *
  `

  const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`
  if (userId !== post.user_id)
    sendNotification({
      userId: post.user_id,
      senderId: userId,
      type: 'comment_post',
      postId,
      io,
    })

  res.status(201).json(newComment)
}

export const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id)
    const userId = req.user.id

    if (isNaN(commentId)) return res.status(400).json({ message: 'Invalid comment id' })

    const [comment] = await sql`
      SELECT * FROM post_comments WHERE id = ${commentId}
    `

    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    if (comment.user_id !== userId)
      return res.status(403).json({ message: 'You cannot delete this comment' })

    await sql`
      DELETE FROM post_comments WHERE id = ${commentId}
    `

    res.status(200).json({ message: 'Comment deleted', commentId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
