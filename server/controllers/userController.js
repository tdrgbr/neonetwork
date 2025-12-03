import { sql } from '../config/db.js'
import bcrypt from 'bcryptjs'
import isURL from 'validator/lib/isURL.js'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

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

export const updateAvatar = async (req, res) => {
  upload.single('avatar')(req, res, async err => {
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

      const storagePath = `avatar-${Date.now()}-${userId}.${ext}`

      const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, processed, {
        contentType: req.file.mimetype,
        upsert: false,
      })

      if (upErr) throw upErr

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(storagePath)

      const [current] = await sql`SELECT avatar FROM users WHERE id=${req.user.id} LIMIT 1;`
      const oldAvatar = current?.avatar

      const [updated] = await sql`
        UPDATE users
        SET avatar = ${publicUrl}
        WHERE id = ${req.user.id}
        RETURNING id, username, avatar;
      `
      return res.status(200).json(updated)
    } catch (err) {
      console.error('[updateAvatar error]', err)
      return res.status(500).json({ message: 'Server error' })
    }
  })
}

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params
    const [user] = await sql`
      SELECT id, username, email, avatar, accountType, created_at
      FROM users
      WHERE username = ${username}
    `
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const getUserIdProfile = async (req, res) => {
  try {
    const { id } = req.params
    const [user] = await sql`
      SELECT id, username, email, avatar, accountType, created_at
      FROM users
      WHERE id = ${id}
    `
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const updateUserType = async (req, res) => {
  try {
    const userId = req.user.id
    const result = await sql`
      UPDATE users
      SET accountType = NOT accountType
      WHERE id = ${userId}
      RETURNING accountType;
    `
    res.json(result[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both fields are required.' })
    }

    const [user] = await sql`
      SELECT password FROM users WHERE id = ${userId}
    `

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE id = ${userId}
    `

    res.json({ message: 'Password updated successfully.' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}
export const updateUsername = async (req, res) => {
  try {
    const userId = req.user.id
    const { username } = req.body

    if (!username.trim()) {
      return res.status(400).json({ message: 'Please enter your username.' })
    }
    if (username.length < 4) {
      return res.status(400).json({ message: 'Your username must have minimum 4 characters.' })
    }

    const [user] = await sql`
      SELECT username FROM users WHERE id = ${userId}
    `
    if (user.username === username)
      return res
        .status(400)
        .json({ message: "Your new username can't be the same as your actual username." })

    const existingUserByName = await sql`
      SELECT id FROM users WHERE username = ${username} AND id != ${userId}
    `
    if (existingUserByName.length > 0) {
      return res.status(409).json({ message: 'This username is already taken.' })
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    await sql`
      UPDATE users
      SET username = ${username}
      WHERE id = ${userId}
    `

    res.json({ message: 'Username updated successfully.' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}
export const updateEmail = async (req, res) => {
  try {
    const userId = req.user.id
    const { email } = req.body

    if (!email.trim()) {
      return res.status(400).json({ message: 'Please enter your email.' })
    }

    const [user] = await sql`
      SELECT email FROM users WHERE id = ${userId}
    `
    if (user.email === email)
      return res
        .status(400)
        .json({ message: "Your new e-mail can't be the same as your actual e-mail." })

    const existingUserByEmail = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${userId}
    `
    if (existingUserByEmail.length > 0) {
      return res.status(409).json({ message: 'This e-mail is already in use.' })
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    await sql`
      UPDATE users
      SET email = ${email}
      WHERE id = ${userId}
    `

    res.json({ message: 'E-mail updated successfully.' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
}
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { username, avatar, password } = req.body

    if (password && password.length < 8)
      return res.status(400).json({ message: 'Password must have minimum 8 characters' })

    let hashedPassword
    if (password) hashedPassword = await bcrypt.hash(password, 10)

    const [updatedUser] = await sql`
      UPDATE users
      SET
        username = ${username || undefined},
        avatar = ${avatar || undefined},
        password = ${hashedPassword || undefined}
      WHERE id = ${userId}
      RETURNING id, username, email, avatar, accountType, created_at
    `

    res.json(updatedUser)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params
    const [user] = await sql`SELECT id FROM users WHERE username = ${username}`
    if (!user) return res.status(404).json({ message: 'User not found' })

    const posts = await sql`
      SELECT p.id, p.description, p.image, p.user_id, p.is_public, p.created_at
      FROM posts p
      WHERE p.user_id = ${user.id} AND p.is_public = TRUE
      ORDER BY p.created_at DESC
    `
    res.json(posts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUserFollowers = async (req, res) => {
  try {
    const { username } = req.params
    const [user] = await sql`SELECT id FROM users WHERE username = ${username}`
    if (!user) return res.status(404).json({ message: 'User not found' })

    const followers = await sql`
      SELECT u.id, u.username, u.avatar, u.accounttype
      FROM followers f
      JOIN users u ON u.id = f.followerId
      WHERE f.followeeId = ${user.id}
    `
    res.json(followers)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const getUserRequesting = async (req, res) => {
  try {
    const { username } = req.params
    const [user] = await sql`SELECT id FROM users WHERE username = ${username}`
    if (!user) return res.status(404).json({ message: 'User not found' })

    const requests = await sql`
      SELECT u.id, u.username, u.avatar
      FROM requests r
      JOIN users u ON u.id = r.followeeId
      WHERE r.followerId = ${user.id}
    `
    res.json(requests)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const getUserRequests = async (req, res) => {
  try {
    const { username } = req.params
    const [user] = await sql`SELECT id FROM users WHERE username = ${username}`
    if (!user) return res.status(404).json({ message: 'User not found' })

    const requests = await sql`
      SELECT u.id, u.username, u.avatar, r.created_at
      FROM requests r
      JOIN users u ON u.id = r.followerId
      WHERE r.followeeid = ${user.id}
    `
    res.json(requests)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const getUserFollowing = async (req, res) => {
  try {
    const { username } = req.params
    const [user] = await sql`SELECT id FROM users WHERE username = ${username}`
    if (!user) return res.status(404).json({ message: 'User not found' })

    const following = await sql`
      SELECT u.id, u.username, u.avatar, u.accounttype
      FROM followers f
      JOIN users u ON u.id = f.followeeId
      WHERE f.followerId = ${user.id}
    `
    res.json(following)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const searchUser = async (req, res) => {
  try {
    const q = req.query.q
    if (q.length < 2) return res.json([])

    const users = await sql`
      SELECT username, avatar
      FROM users
      WHERE username ILIKE ${'%' + q + '%'}
      LIMIT 5
    `

    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getDiscover = async (req, res) => {
  try {
    const userId = req.user.id
    if (!userId) return 1

    const users = await sql`
      SELECT
        u.id,
        u.username,
        u.avatar,
        COALESCE(fc.followers_count, 0) AS followers_count
      FROM users u
      LEFT JOIN (
        SELECT followeeId AS user_id, COUNT(*)::int AS followers_count
        FROM followers
        GROUP BY followeeId
      ) fc ON fc.user_id = u.id
      WHERE u.id <> ${userId}
        AND NOT EXISTS (
          SELECT 1
          FROM followers f
          WHERE f.followerId = ${userId}
            AND f.followeeId = u.id
        )
      AND u.accountType = TRUE   
      ORDER BY RANDOM()
      LIMIT 15;
    `

    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
