# Streamify - MERN Music Streaming Service

Streamify is a Spotify-inspired music streaming web app built with the MERN stack in JavaScript. It includes a React music player UI, an Express API, MongoDB/Mongoose data models, JWT authentication, playlists, liked songs, listening history, search, genre filters, albums, and seeded demo content.

The project is designed to run locally without installing MongoDB by using an embedded development database. You can later switch to a real MongoDB Atlas or local MongoDB connection string for persistent data.

## Features

- User registration and login with JWT authentication
- Spotify-style responsive music dashboard
- Audio player with play, pause, next, previous, and progress controls
- Song search by title, mood, and genre
- Genre filter chips
- Albums section
- Liked songs library
- Recently played history
- Playlist creation support
- Demo seed data with artists, albums, songs, and a demo user
- Express REST API
- MongoDB models with Mongoose
- In-memory MongoDB for no-install local development

## Tech Stack

- MongoDB / MongoDB Memory Server
- Express.js
- React
- Node.js
- Mongoose
- Vite
- JWT
- bcryptjs
- lucide-react

## Project Structure

```text
MusicStreamingService/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── app.js
│   │   ├── seed.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── package.json
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone The Repository

```bash
git clone https://github.com/your-username/music-streaming-service.git
cd music-streaming-service
```

If you are already inside this local project folder, you can skip cloning.

### 2. Install Dependencies

```bash
npm run install:all
```

This installs dependencies for the root project, backend, and frontend.

### 3. Create Environment Files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The default local setup uses:

```env
PORT=5050
MONGODB_URI=memory
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

`MONGODB_URI=memory` starts an embedded MongoDB instance from the Node app, so MongoDB does not need to be installed for local development.

For persistent data, replace it with a MongoDB URI:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streamify
```

### 4. Start The App

```bash
npm run dev
```

The app runs at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5050`

The backend automatically seeds demo data when using `MONGODB_URI=memory`.

### 5. Demo Login

```text
Email: demo@streamify.dev
Password: password123
```

## Available Scripts

Run these from the project root:

```bash
npm run dev
```

Starts both the backend and frontend in development mode.

```bash
npm run server
```

Starts only the Express backend.

```bash
npm run client
```

Starts only the React frontend.

```bash
npm run seed
```

Seeds the database with demo artists, albums, songs, playlists, and a demo user.

```bash
npm run install:all
```

Installs root, server, and client dependencies.

## API Routes

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Songs

```text
GET   /api/songs
GET   /api/songs/trending
PATCH /api/songs/:id/play
PATCH /api/songs/:id/like
```

### Albums

```text
GET /api/albums
GET /api/albums/:id
```

### Playlists

```text
GET    /api/playlists
POST   /api/playlists
PATCH  /api/playlists/:id/songs/:songId
DELETE /api/playlists/:id
```

### User Library

```text
GET /api/users/library
```

## What To Upload To GitHub

Commit these:

- `README.md`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `client/package.json`
- `client/package-lock.json`
- `client/.env.example`
- `client/index.html`
- `client/src/`
- `server/package.json`
- `server/package-lock.json`
- `server/.env.example`
- `server/src/`

Do not commit these:

- `node_modules/`
- `client/node_modules/`
- `server/node_modules/`
- `client/dist/`
- `server/.env`
- `client/.env`
- `.DS_Store`

The `.gitignore` file already excludes generated dependencies, build output, and private environment files.

## GitHub Upload Commands

From the project folder:

```bash
git init
git add .
git commit -m "Initial MERN music streaming service"
git branch -M main
git remote add origin https://github.com/your-username/music-streaming-service.git
git push -u origin main
```

Replace `your-username` and `music-streaming-service` with your GitHub username and repository name.

## Future Improvements

- Add playlist detail pages
- Add song upload for admins
- Add profile editing
- Add artist pages
- Add album detail pages
- Add queue management
- Add real audio storage with Cloudinary, AWS S3, or Firebase Storage
- Add deployment config for Render, Railway, Vercel, or Netlify
- Add tests for API routes and React components

## Notes

- The sample music files use externally hosted preview MP3 URLs.
- The sample images use external image URLs.
- In-memory MongoDB is convenient for demos, but data resets when the backend restarts.
- Use MongoDB Atlas or a local MongoDB server when you want permanent data.
