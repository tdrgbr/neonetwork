import { sql } from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const addUser = async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'You must fill out everything' })
    }

    if (username.length < 4 || username.length > 15) {
      return res.status(400).json({ message: 'Username must be between 4 and 15 characters' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must have minimum 8 characters' })
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    const existing = await sql`
      SELECT * FROM users WHERE email = ${email} OR username = ${username}
    `
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING id, username, email;
    `

    const newUser = result[0]

    const accessToken = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign({ id: newUser.id }, process.env.REFRESH_SECRET, {
      expiresIn: '7d',
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(201).json({
      user: newUser,
      accessToken,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

    const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    const { password: _, ...userData } = user
    res.json({
      accessToken,
      user: userData,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Not authenticated' })

    const [user] =
      await sql`SELECT id, username, email, avatar, accounttype FROM users WHERE id = ${userId}`
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const logoutUser = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    res.json({ message: 'Logout successful' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
export const refreshToken = (req, res) => {
  try {
    const { refreshToken } = req.cookies
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' })

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)

    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.json({ accessToken: newAccessToken })
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }
}
