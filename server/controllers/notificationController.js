import { sql } from '../config/db.js'

export const sendNotification = async ({
  userId,
  senderId,
  type,
  postId = null,
  storyId = null,
  io,
}) => {
  const notification = await sql`
  WITH inserted AS (
    INSERT INTO notifications (user_id, sender_id, type, post_id, story_id)
    VALUES (${userId}, ${senderId}, ${type}, ${postId}, ${storyId})
    RETURNING *
  )
  SELECT 
    inserted.*,
    users.username AS sender_username,
    users.avatar AS sender_avatar
    FROM inserted
    JOIN users ON users.id = inserted.sender_id;
  `

  io.to(`user_${userId}`).emit('receiveNotification', notification[0])
}
export const getNotifications = async (req, res) => {
  try {
    const user = req.user
    if (!user?.id) return res.json([])

    const notifications = await sql`
      SELECT 
        n.id,
        n.type,
        n.post_id,
        n.story_id,
        n.created_at,
        u.id AS sender_id,
        u.username AS sender_username,
        u.avatar AS sender_avatar
      FROM notifications n
      JOIN users u ON u.id = n.sender_id
      WHERE n.user_id = ${user.id}
      ORDER BY n.created_at DESC
      LIMIT 30
    `

    res.json(notifications)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
