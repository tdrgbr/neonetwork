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

# Screenshots
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203503" src="https://github.com/user-attachments/assets/40b7d0cc-1c60-4d33-97b9-008460390e2f" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203458" src="https://github.com/user-attachments/assets/87576d27-0f9c-445a-a010-52747741a497" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203454" src="https://github.com/user-attachments/assets/b8ab4c79-8c94-46c5-a576-18fa93fa6af6" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203449" src="https://github.com/user-attachments/assets/fb636725-2708-4943-827e-1c7a05532aeb" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203447" src="https://github.com/user-attachments/assets/2ead693f-0ca7-4ba9-b264-071da284714a" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203442" src="https://github.com/user-attachments/assets/8cdbdc71-e50f-4546-8e4d-5c1073851e04" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203340" src="https://github.com/user-attachments/assets/8ee036f5-63bc-46ab-8f92-c9a19e591150" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203439" src="https://github.com/user-attachments/assets/94b0da13-7bbb-4ff1-8ffe-ccebd2b6dc12" />
<img width="1907" height="1079" alt="Screenshot 2026-04-06 203433" src="https://github.com/user-attachments/assets/da11a428-eb3b-4700-a98e-05954f25602f" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203430" src="https://github.com/user-attachments/assets/e23ccb7a-4daf-4535-96fe-542e0ee4faed" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203349" src="https://github.com/user-attachments/assets/4553ee18-b004-4f61-8f7b-db7b2ccfa57b" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203345" src="https://github.com/user-attachments/assets/a08c079e-c64f-4450-95d4-bde116c610bd" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203510" src="https://github.com/user-attachments/assets/adffb561-196d-4ca9-b0b6-babb1bb9a0d1" />
<img width="1919" height="1079" alt="Screenshot 2026-04-06 203513" src="https://github.com/user-attachments/assets/56031232-2634-43d8-98c5-e476cfd07876" />

