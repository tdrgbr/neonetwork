import { sql } from '../config/db.js'
import { sendNotification } from './notificationController.js'
import isURL from 'validator/lib/isURL.js'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import FormData from 'form-data'

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

export const addStory = async (req, res) => {
  upload.single('image')(req, res, async err => {
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

      const storagePath = `story-${Date.now()}-${userId}.${ext}`

      const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, processed, {
        contentType: req.file.mimetype,
        upsert: false,
      })

      if (upErr) throw upErr

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(storagePath)

      const rows = await sql`
        INSERT INTO stories (image, user_id, is_public)
        VALUES (${publicUrl}, ${userId}, ${is_public})
        RETURNING id, image, user_id, is_public, created_at
      `

      return res.status(201).json(rows[0])
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Server error', error: error.message })
    }
  })
}

export const getStoryStats = async (req, res) => {
  try {
    const user = req.user.id
    if (!user) return res.status(401).json({ message: 'Unauthenticated' })

    const storyCheck = await sql`
      SELECT id
      FROM stories
      WHERE user_id = ${user} AND is_public = TRUE
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (!storyCheck.length) return res.status(404).json({ message: 'No active story' })

    const storyId = storyCheck[0].id

    const rows = await sql`
      SELECT
        s.id,
        s.image,
        s.user_id,
        s.is_public,
        s.created_at,
        u.username,
        u.avatar,

        COUNT(DISTINCT sv.user_id) AS views_count,
        COUNT(DISTINCT sl.user_id) AS likes_count,

        COALESCE(
          JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', vu.id,
            'username', vu.username,
            'avatar', vu.avatar
          )) FILTER (WHERE vu.id IS NOT NULL),
          '[]'
        ) AS viewers,

        COALESCE(
          JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', lu.id,
            'username', lu.username,
            'avatar', lu.avatar
          )) FILTER (WHERE lu.id IS NOT NULL),
          '[]'
        ) AS likers

      FROM stories s
      JOIN users u            ON u.id = s.user_id
      LEFT JOIN story_views sv ON sv.story_id = s.id
      LEFT JOIN users vu       ON vu.id = sv.user_id
      LEFT JOIN story_likes sl ON sl.story_id = s.id
      LEFT JOIN users lu       ON lu.id = sl.user_id
      WHERE s.id = ${storyId} AND s.is_public = TRUE
      AND s.created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY s.id, u.id
      LIMIT 1
    `

    if (!rows.length) return res.status(404).json({ message: 'Story not found' })

    return res.json(rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getUserStory = async (req, res) => {
  try {
    const storyOwnerId = parseInt(req.params.id)
    const viewerId = req.user.id

    if (isNaN(storyOwnerId)) return res.status(400).json({ message: 'Invalid story id' })

    const [owner] = await sql`
      SELECT id, accounttype FROM users WHERE id = ${storyOwnerId}
    `

    if (owner.id !== viewerId) {
      const [followCheck] = await sql`
        SELECT 1 FROM followers
        WHERE followerid = ${viewerId} AND followeeid = ${storyOwnerId}
        LIMIT 1
      `

      if (!owner.accounttype && !followCheck) {
        return res.status(403).json({ message: 'Story not available' })
      }
    }

    const [story] = await sql`
      SELECT
        s.id,
        s.image,
        s.user_id,
        s.is_public,
        s.created_at,
        u.username,
        u.avatar,
        EXISTS (
          SELECT 1 FROM story_views sv
          WHERE sv.story_id = s.id AND sv.user_id = ${viewerId}
        ) AS viewed,
        EXISTS (
          SELECT 1 FROM story_likes sl
          WHERE sl.story_id = s.id AND sl.user_id = ${viewerId}
        ) AS liked_by_me
      FROM stories s
      JOIN users u ON u.id = s.user_id
      WHERE s.user_id = ${storyOwnerId} AND s.is_public = TRUE AND s.created_at >= NOW() - INTERVAL '24 hours'
      LIMIT 1
    `

    if (!story) return res.status(404).json({ message: 'Story not found' })

    res.json(story)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getStories = async (req, res) => {
  try {
    const userId = req.user.id
    if (!userId) return 0
    const stories = await sql`
      SELECT
        s.id,
        s.image,
        s.user_id,
        s.is_public,
        s.created_at,
        u.username,
        u.avatar,
        EXISTS (
          SELECT 1 FROM story_views sv
          WHERE sv.story_id = s.id AND sv.user_id = ${userId}
        ) AS viewed,
        EXISTS (
          SELECT 1 FROM story_likes sl
          WHERE sl.story_id = s.id AND sl.user_id = ${userId}
        ) AS liked_by_me
      FROM stories s
      JOIN users u ON u.id = s.user_id
      JOIN followers f ON f.followeeId = s.user_id
      WHERE f.followerId = ${userId} AND s.is_public = TRUE AND s.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY viewed ASC, s.created_at DESC
    `

    res.json(stories)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteStory = async (req, res) => {
  try {
    const storyId = parseInt(req.params.id)
    const userId = req.user.id

    if (isNaN(storyId)) return res.status(400).json({ message: 'Invalid story id' })

    const [story] = await sql`SELECT * FROM stories WHERE id = ${storyId}`

    if (!story) return res.status(404).json({ message: 'Story not found' })
    if (story.user_id !== userId)
      return res.status(403).json({ message: 'You cannot delete this story' })

    await sql`
      UPDATE stories
      SET is_public = FALSE
      WHERE id = ${storyId}
    `

    res.status(200).json({ message: 'Story set to private', storyId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const likeStory = async (req, res) => {
  const userId = req.user.id
  const storyId = parseInt(req.params.id)
  const io = req.app.get('io')

  const [story] = await sql`SELECT * FROM stories WHERE id = ${storyId}`
  if (!story) return res.status(404).json({ message: 'Story not found' })

  const [existing] = await sql`
    SELECT * FROM story_likes WHERE story_id = ${storyId} AND user_id = ${userId}
  `

  if (existing) {
    await sql`DELETE FROM story_likes WHERE story_id = ${storyId} AND user_id = ${userId}`
    return res.status(200).json({ message: 'Story unliked' })
  }

  await sql`INSERT INTO story_likes (story_id, user_id) VALUES (${storyId}, ${userId})`

  sendNotification({
    userId: story.user_id,
    senderId: userId,
    type: 'like_story',
    storyId,
    io,
  })

  res.status(201).json({ message: 'Story liked' })
}
export const viewStory = async (req, res) => {
  const userId = req.user.id
  if (!userId) return res.status(401)
  const storyId = parseInt(req.params.id)
  const [story] = await sql`SELECT * FROM stories WHERE id = ${storyId}`
  if (!story) return res.status(404).json({ message: 'Story not found' })

  const [existing] = await sql`
    SELECT * FROM story_views WHERE story_id = ${storyId} AND user_id = ${userId}
  `

  if (existing) {
    return 0
  }

  await sql`INSERT INTO story_views (story_id, user_id) VALUES (${storyId}, ${userId})`

  res.status(201).json({ message: 'Story viewed' })
}
