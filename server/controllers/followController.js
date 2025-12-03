import { sql } from '../config/db.js'

import { sendNotification } from './notificationController.js'

export const followUser = async (req, res) => {
  const followerId = req.user.id
  const followeeId = parseInt(req.params.id)
  const io = req.app.get('io')

  if (followerId === followeeId) return res.status(400).json({ message: 'Cannot follow yourself' })

  const [existing] = await sql`
    SELECT * FROM followers WHERE followerId = ${followerId} AND followeeId = ${followeeId}
  `

  if (existing) {
    await sql`
      DELETE FROM notifications WHERE sender_id = ${followerId} AND type = 'follow'
    `
    await sql`
      DELETE FROM followers WHERE followerId = ${followerId} AND followeeId = ${followeeId}
    `
    return res.status(200).json({ message: 'User unfollowed' })
  }

  await sql`
    INSERT INTO followers (followerId, followeeId) VALUES (${followerId}, ${followeeId})
  `
  const [notification] = await sql`
    SELECT * FROM notifications WHERE sender_id = ${followerId} AND type = 'follow'
  `
  if (notification) {
    await sql`
      DELETE FROM notifications WHERE sender_id = ${followerId} AND type = 'follow'
    `
  }
  sendNotification({
    userId: followeeId,
    senderId: followerId,
    type: 'follow',
    io,
  })

  res.status(201).json({ message: 'User followed' })
}

export const requestFollow = async (req, res) => {
  const followerId = req.user.id
  const followeeId = parseInt(req.params.id)
  const io = req.app.get('io')

  if (followerId === followeeId) return res.status(400).json({ message: 'Cannot follow yourself' })

  const [existing] = await sql`
    SELECT * FROM followers WHERE followerId = ${followerId} AND followeeId = ${followeeId}
  `

  if (existing) {
    await sql`
      DELETE FROM followers WHERE followerId = ${followerId} AND followeeId = ${followeeId}
    `
    return res.status(200).json({ message: 'User unfollowed' })
  }

  const [existingreq] = await sql`
    SELECT * FROM requests WHERE followerId = ${followerId} AND followeeId = ${followeeId}
  `

  if (existingreq) {
    await sql`
      DELETE FROM requests WHERE followerId = ${followerId} AND followeeId = ${followeeId}
    `
    return res.status(200).json({ message: 'User unfollowed' })
  }

  await sql`
    INSERT INTO requests (followerId, followeeId) VALUES (${followerId}, ${followeeId})
  `

  res.status(201).json({ message: 'User follow requested' })
}

export const acceptRequest = async (req, res) => {
  const followeeId = req.user.id
  const followerId = parseInt(req.params.id)
  const io = req.app.get('io')

  if (followerId === followeeId) return res.status(400).json({ message: 'Cannot follow yourself' })

  const [existing] = await sql`
    SELECT * FROM requests WHERE followerId = ${followerId} AND followeeId = ${followeeId}
  `

  if (!existing) return res.status(400).json({ message: 'Request not found' })

  await sql`
      DELETE FROM requests WHERE followerId = ${followerId} AND followeeId = ${followeeId}
  `

  await sql`
    INSERT INTO followers (followerId, followeeId) VALUES (${followerId}, ${followeeId})
  `
  const [notification] = await sql`
    SELECT * FROM notifications WHERE sender_id = ${followerId} AND type = 'follow'
  `
  if (notification) {
    await sql`
      DELETE FROM notifications WHERE sender_id = ${followerId} AND type = 'follow'
    `
  }
  sendNotification({
    userId: followeeId,
    senderId: followerId,
    type: 'follow',
    io,
  })

  res.status(201).json({ message: 'Request accepted' })
}
export const declineRequest = async (req, res) => {
  const followeeId = req.user.id
  const followerId = parseInt(req.params.id)
  const io = req.app.get('io')

  if (followerId === followeeId) return res.status(400).json({ message: 'Cannot follow yourself' })

  const [existing] = await sql`
    SELECT * FROM requests WHERE followerId = ${followerId} AND followeeId = ${followeeId}
  `

  if (!existing) return res.status(400).json({ message: 'Request not found' })

  await sql`
      DELETE FROM requests WHERE followerId = ${followerId} AND followeeId = ${followeeId}
  `
  res.status(201).json({ message: 'Request declined' })
}
