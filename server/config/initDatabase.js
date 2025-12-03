import { sql } from './db.js'

export const initDatabase = async () => {
  try {
    // Users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(20) NOT NULL,
        email VARCHAR(64) NOT NULL UNIQUE,
        avatar VARCHAR(255) NOT NULL DEFAULT '/uploads/avatars/default_avatar.png',
        password VARCHAR(255) NOT NULL,
        accountType BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Posts
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255),
        image VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `

    // Stories
    await sql`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        image VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `

    // Posts Likes
    await sql`
      CREATE TABLE IF NOT EXISTS posts_likes (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `

    // Story Likes
    await sql`
      CREATE TABLE IF NOT EXISTS story_likes (
        id SERIAL PRIMARY KEY,
        story_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (story_id) REFERENCES stories(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `

    // Story Likes
    await sql`
      CREATE TABLE IF NOT EXISTS story_views (
        id SERIAL PRIMARY KEY,
        story_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (story_id) REFERENCES stories(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `
    // Post Comments
    await sql`
      CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        comment VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `

    // Followers
    await sql`
      CREATE TABLE IF NOT EXISTS followers (
        followerId INT NOT NULL,
        followeeId INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (followerId) REFERENCES users(id),
        FOREIGN KEY (followeeId) REFERENCES users(id),
        PRIMARY KEY (followerId, followeeId)
      );
    `

    // Follow Requests
    await sql`
      CREATE TABLE IF NOT EXISTS requests (
        followerId INT NOT NULL,
        followeeId INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (followerId) REFERENCES users(id),
        FOREIGN KEY (followeeId) REFERENCES users(id),
        PRIMARY KEY (followerId, followeeId)
      );
    `

    // Conversations
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        firstUser INT NOT NULL,
        secondUser INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (firstUser) REFERENCES users(id),
        FOREIGN KEY (secondUser) REFERENCES users(id)
      );
    `

    // Messages
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversationId INT NOT NULL,
        message VARCHAR(255) NOT NULL,
        senderId INT NOT NULL,
        seen BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversationId) REFERENCES conversations(id),
        FOREIGN KEY (senderId) REFERENCES users(id)
      );
    `

    // Notifications

    await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      sender_id INT NOT NULL,
      type VARCHAR(20) NOT NULL,        -- follow, like_post, comment_post, like_story, comment_story
      post_id INT,
      story_id INT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );
    `
    console.log('Database initialized successfully!')
  } catch (e) {
    console.error('Error initializing database:', e)
  }
}
