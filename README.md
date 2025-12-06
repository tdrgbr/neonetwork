# NeoNetwork
# Live at: https://neonetwork.vercel.app/

NeoNetwork is a social network prototype app built with React, Tailwind CSS, Express.js and PostgreSQL, designed to be fully functional and responsive for desktop and mobile.
The goal of the project is to create a complete and interactive UI/UX integrated with a simple backend solution using Express.js and a PostgreSQL database.

# Used technologies

• Front-end: React and Tailwind CSS

• Back-end: Node.js (Express)

• UI: Built with from scratch

• Database Provider: Neon (PostgreSQL)

# Features

## Responsive Design

• Optimized for any type of screen.

## User Accounts

• Register, login, change password/email, update avatar.

• Switch account type (Public / Private).

## Follow System

• Public accounts can be followed instantly.

• Private accounts require approval (requests go into a pending list).

## Messaging

• Simple direct messaging system with real-time features.

## Stories

• Users can post one photo per day which is visible for 24 hours.

• Stories are visible to followers (or to everyone if the account is public).

• Stories can be deleted anytime and liked by others.

• Click/tap to pause story

## Posts

• Users can like and comment on posts from the accounts they follow.

## Real-Time Notifications

• Users get notified instantly when:

o Someone likes their story or post.

o Someone follows them or requests to follow.

o Someone comments on their post.

## Feed

• Displays posts from followers.

• If it’s empty, posts from the most popular NeoNetwork users are shown.

## Discover Page

• Users can find and explore new users to follow.

# Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/tdrgbr/neonetwork.git
   ```

2. Install dependencies for both client and server:

```
 cd neonetwork
 cd client
 npm install
 cd ../server
 npm install

```

3. Create a new database on https://neon.tech/ (it's free)

4. Create a new database on Supabase (It's just for content upload)

5. Create a new account on TheHive (for uploads protection against NSFW content)

6. Create a .env file in the server directory with data as following:

```
PORT=port

PGUSER=your_neon.tech_postgres_user
PGHOST=your_neon.tech_postgres_hostname
PGDATABASE=your_neon.tech_postgres_db
PGPASSWORD=your_neon.tech_db_password

NODE_ENV=development / production
JWT_SECRET=your_jwt_secret_code
REFRESH_SECRET=your_jwt_refresh_secret_code

CLIENT_URL=your_client_adress
SERVER_URL=your_server_adress

SUPABASE_KEY=your_supabase_api_key
HIVE_SECRET_KEY=your_hive_secret_key
HIVE_THRESHOLD=0.5

```

5. Create a .env file in the client directory with data as following:

```
VITE_DOMAIN= Your backend server URL, e.g. http://localhost:3000 for local development or your production API URL.
```

6. Deploy on localhost

```
cd neonetwork
cd server
npm start

cd ../client
npm run dev
```

# Tips

Configure CORS origin in `server/index.js` based on your client URL.

Configure IO origin in `server/index.js` based on your server URL
