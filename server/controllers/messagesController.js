import { sql } from '../config/db.js'

export const createConversation = async (req, res) => {
  try {
    const { withUserId } = req.body
    const firstUser = req.user.id

    if (firstUser === withUserId)
      return res.status(400).json({ message: 'You cannot message yourself' })

    const [existing] = await sql`
      SELECT * FROM conversations
      WHERE (firstuser = ${firstUser} AND seconduser = ${withUserId})
         OR (firstuser = ${withUserId} AND seconduser = ${firstUser})
    `

    if (existing) return res.status(200).json(existing)

    const [conversation] = await sql`
      INSERT INTO conversations (firstuser, seconduser)
      VALUES (${firstUser}, ${withUserId})
      RETURNING *
    `

    res.status(201).json(conversation)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const markConversationAsSeen = async (req, res) => {
  try {
    const conversationId = req.params.conversationId
    const userId = req.user.id

    if (!conversationId || isNaN(conversationId))
      return res.status(400).json({ message: 'Invalid conversation id' })

    const [conversation] = await sql`
      SELECT id FROM conversations
      WHERE id = ${conversationId}
      AND (${userId} = firstuser OR ${userId} = seconduser)
    `

    if (!conversation)
      return res.status(403).json({ message: 'You are not part of this conversation' })

    await sql`
      UPDATE messages
      SET seen = TRUE
      WHERE conversationid = ${conversationId} AND senderid != ${userId} AND seen = FALSE
    `

    res.status(200).json({ message: 'Messages marked as seen' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUnreadMessages = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await sql`
      SELECT COUNT(*)::int AS count
      FROM messages m
      JOIN conversations c ON c.id = m.conversationId
      WHERE m.seen = FALSE
        AND (c.firstuser = ${userId} OR c.seconduser = ${userId})
        AND m.senderid != ${userId}
    `

    res.json({ count: result[0].count })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body
    const senderId = req.user.id

    if (!message || message.trim() === '')
      return res.status(400).json({ message: 'Message cannot be empty' })

    if (message.length > 255) return res.status(400).json({ message: 'Message too long' })

    const [conversation] = await sql`
      SELECT id FROM conversations
      WHERE id = ${conversationId}
      AND (firstuser = ${senderId} OR seconduser = ${senderId})
    `

    if (!conversation)
      return res.status(403).json({ message: 'You are not part of this conversation' })

    const [msg] = await sql`
      INSERT INTO messages (conversationid, message, senderid)
      VALUES (${conversationId}, ${message}, ${senderId})
      RETURNING *
    `

    res.status(201).json(msg)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getConversationParticipant = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    if (!conversationId) {
      return res.status(400).json({ message: 'Missing conversation ID' })
    }
    const [conversation] = await sql`
      SELECT firstuser, seconduser
      FROM conversations
      WHERE id = ${conversationId}
      AND (${userId} = firstuser OR ${userId} = seconduser)
    `

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found or unauthorized' })
    }
    if (conversation.firstuser === userId) {
      const [participant] = await sql`
        SELECT id, username, avatar
        FROM users
        WHERE id = ${conversation.seconduser}
      `
      res.status(200).json(participant)
    } else {
      const [participant] = await sql`
        SELECT id, username, avatar
        FROM users
        WHERE id = ${conversation.firstuser}
      `
      res.status(200).json(participant)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 30
    const offset = parseInt(req.query.offset) || 0

    const conversations = await sql`
      SELECT
        c.id,
        c.created_at,
        CASE 
          WHEN c.firstuser = ${userId} THEN c.seconduser
          ELSE c.firstuser
        END AS partner_id,
        u.username AS partner_username,
        u.avatar AS partner_avatar,
        m.message AS last_message,
        m.senderid AS last_sender_id,
        m.created_at AS last_message_time,
        (m.senderid != ${userId} AND m.seen = false) AS is_unread
      FROM conversations c
      JOIN users u
        ON u.id = (
          CASE 
            WHEN c.firstuser = ${userId} THEN c.seconduser
            ELSE c.firstuser
          END
        )
      LEFT JOIN LATERAL (
        SELECT message, created_at, senderid, seen
        FROM messages
        WHERE conversationid = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON TRUE
      WHERE ${userId} IN (c.firstuser, c.seconduser)
      ORDER BY m.created_at DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset};
    `

    res.status(200).json(conversations)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getMessages = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 30
    const offset = parseInt(req.query.offset) || 0

    if (isNaN(conversationId)) return res.status(400).json({ message: 'Invalid conversation id' })

    const [conv] = await sql`
      SELECT * FROM conversations
      WHERE id = ${conversationId}
        AND (${userId} = firstuser OR ${userId} = seconduser)
    `

    if (!conv) {
      return res.status(403).json({ message: 'You are not part of this conversation.' })
    }

    const messages = await sql`
      SELECT m.id, m.conversationid, m.message, m.senderid, m.seen, m.created_at, u.username
      FROM messages m
      JOIN users u ON u.id = m.senderId
      WHERE m.conversationid = ${conversationId}
      ORDER BY m.created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `

    res.status(200).json(messages.reverse())
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
