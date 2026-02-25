# Nova Drive 🚀

[![Build Status](https://github.com/kaihere14/Nova_Drive/actions/workflows/ci.yml/badge.svg)](https://github.com/kaihere14/Nova_Drive/actions/workflows/ci.yml)  
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)  
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)](https://github.com/kaihere14/Nova_Drive/releases)  

**Live Demo**: <https://nova-drive-one.vercel.app> • **API Docs**: <https://backend.novadrive.space/docs>  

---

## Overview

**Nova Drive** is a modern, cloud‑native file‑storage and collaboration platform. It provides a sleek React front‑end powered by Vite & TailwindCSS and a robust TypeScript/Express back‑end that handles authentication, file uploads, chunked uploads, AI‑enhanced PDF parsing, and background processing with BullMQ.

> **Why Nova Drive?**  
> • Scalable architecture with Redis‑backed job queues.  
> • Seamless integration with AWS S3, Cloudinary, Google Generative AI, and OpenAI.  
> • Secure JWT authentication + OAuth (Google).  
> • Real‑time health monitoring & structured logging.

Target audience: developers building SaaS file‑storage services, teams needing a ready‑to‑run cloud drive, or anyone looking for a reference implementation of a full‑stack TypeScript/React app.

Current version: **v1.0.0** (stable).

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| **User Management** | Register, login, password reset, OTP verification, JWT auth. | ✅ Stable |
| **Google OAuth** | One‑click sign‑in with Google accounts. | ✅ Stable |
| **File Uploads** | Single & multipart uploads, streaming to S3/Cloudinary. | ✅ Stable |
| **Chunked Uploads** | Large files are split into chunks, processed via BullMQ workers. | ✅ Stable |
| **AI PDF Extraction** | Parse PDFs and generate summaries using OpenAI & Google Generative AI. | 🟡 Beta |
| **Folder Structure** | Create, rename, move, and delete virtual folders. | ✅ Stable |
| **Activity Logs** | Centralised logging with Winston, persisted to files. | ✅ Stable |
| **Health & Metrics** | `/health` endpoint, Express‑status‑monitor UI. | ✅ Stable |
| **Background Jobs** | Queue‑based processing (e.g., virus scan, thumbnail generation). | ✅ Stable |
| **Responsive UI** | TailwindCSS + Framer Motion for smooth animations. | ✅ Stable |
| **Docker Ready** | Dockerfile & docker‑compose examples for production. | 🟡 Experimental |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, Vite 7, TailwindCSS 4, Framer Motion, Lucide‑React, Axios | SPA, UI, animations, HTTP client |
| **Backend** | Node.js, Express 4, TypeScript 5, BullMQ, Redis, Mongoose (MongoDB) | API, type safety, job queues |
| **Storage** | AWS S3, Cloudinary | Object storage for uploaded files |
| **AI** | OpenAI SDK, @google/generative‑ai | PDF summarisation & content generation |
| **Auth** | JWT, bcrypt, Google OAuth | Secure authentication |
| **DevOps** | GitHub Actions (CI/CD), Vercel (frontend), Railway/Render (backend) | CI, deployment |
| **Monitoring** | Winston, express‑status‑monitor | Structured logging & health UI |
| **Testing** | (future) Jest, React Testing Library | Unit & integration tests (planned) |

---

## Architecture

```
root
├─ client/                # React Vite app
│  ├─ src/
│  │  ├─ components/     # UI components
│  │  ├─ pages/          # Route pages
│  │  ├─ context/        # React context (auth, theme)
│  │  └─ utils/          # API wrappers (axios)
│  └─ vite.config.js
└─ server/                # Express TypeScript API
   ├─ src/
   │  ├─ config/         # DB, env, redis config
   │  ├─ controllers/    # Business logic
   │  ├─ middleware/     # Auth, error handling
   │  ├─ models/         # Mongoose schemas
   │  ├─ routes/         # REST endpoints
   │  └─ utils/
   │     └─ bullmqJobs.ts # Queue & worker definitions
   └─ tsconfig.json
```

* **Client ↔ API** – The front‑end talks to the back‑end via the `BASE_URL` defined in `client/src/config.js`. In production it points to `https://backend.novadrive.space`; locally it uses `http://localhost:3000`.

* **Chunked Upload Flow** – Files > 5 MB are split into chunks, each chunk is posted to `/api/chunks`. A BullMQ queue processes the chunks, assembles them, and stores the final file in S3/Cloudinary.

* **Background Workers** – Workers run in the same Node process (started in `server/src/utils/bullmqJobs.ts`) and listen to queues for tasks such as PDF parsing, thumbnail generation, and email notifications.

* **Graceful Shutdown** – The server listens for `SIGTERM`, `SIGINT`, uncaught exceptions, and unhandled rejections, ensuring workers, queues, and Redis connections close cleanly.

---

## Getting Started

### Prerequisites

| Tool | Minimum Version |
|------|-----------------|
| **Node.js** | 20.x |
| **npm** | 10.x (or Yarn) |
| **Docker** *(optional for production)* | 24.x |
| **MongoDB** | 7.x (or Atlas URI) |
| **Redis** | 7.x (or Redis Cloud) |
| **AWS Account** | Access key + secret for S3 bucket |
| **Google Cloud Project** | Service account JSON for Generative AI |
| **OpenAI API Key** | `OPENAI_API_KEY` |

### Installation

#### 1️⃣ Clone the repo

```bash
git clone https://github.com/kaihere14/Nova_Drive.git
cd Nova_Drive
```

#### 2️⃣ Set up environment variables

Create a `.env` file in the **server** directory (example below). The client reads the `BASE_URL` from its own `config.js`, which automatically switches based on `NODE_ENV`.

```dotenv
# server/.env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/novadrive

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_S3_BUCKET=novadrive-bucket
AWS_REGION=us-east-1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Generative AI
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=./path/to/google-service-account.json

# OpenAI
OPENAI_API_KEY=sk-...

# Email (Resend)
RESEND_API_KEY=your_resend_key
```

> **Tip:** Keep the `.env` file out of version control (`.gitignore` already includes it).

#### 3️⃣ Install server dependencies

```bash
cd server
npm ci          # clean install based on lockfile
npm run build   # compile TypeScript to ./dist
```

#### 4️⃣ Install client dependencies

```bash
cd ../client
npm ci
```

### Running Locally

#### Server (development)

```bash
cd ../server
npm run dev          # uses nodemon + tsx for hot reload
# Server will be reachable at http://localhost:3000
```

#### Client (development)

```bash
cd ../client
npm run dev          # starts Vite dev server on http://localhost:5173
```

Open <http://localhost:5173> in your browser – the app will automatically proxy API calls to the local back‑end.

### Production Build

```bash
# Server
cd server
npm run build
npm start            # runs compiled JS from ./dist

# Client
cd ../client
npm run build        # outputs static files to ./dist
# Serve the static folder with any static web server (e.g., Vercel, Netlify, Nginx)
```

---

## Usage

### Authentication Flow (example)

```bash
# Register a new user
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"StrongP@ssw0rd"}'

# Login
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"StrongP@ssw0rd"}'
# → receives { accessToken, refreshToken }
```

The client stores the JWT in an HttpOnly cookie (see `client/src/context/AuthContext.jsx`) and automatically attaches it to subsequent requests.

### Upload a File (single)

```bash
curl -X POST http://localhost:3000/api/files \
  -H "Authorization: Bearer <JWT>" \
  -F "file=@/path/to/photo.jpg"
```

### Chunked Upload (large file)

```bash
# 1️⃣ Initiate upload session
curl -X POST http://localhost:3000/api/files/init \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"filename":"big-video.mp4","size":123456789}'

# 2️⃣ Upload each chunk (example for chunk #1)
curl -X POST http://localhost:3000/api/chunks \
  -H "Authorization: Bearer <JWT>" \
  -F "sessionId=abc123" \
  -F "chunkIndex=0" \
  -F "chunk=@chunk0.bin"
```

The server assembles chunks in the background and stores the final file once all parts are received.

### AI PDF Summarisation

```bash
curl -X POST http://localhost:3000/api/files/parse-pdf \
  -H "Authorization: Bearer <JWT>" \
  -F "file=@/path/to/document.pdf"
# → returns { summary: "...", topics: [...] }
```

---

## API Documentation

> Base URL: `https://backend.novadrive.space/api` (or `http://localhost:3000/api` for local dev)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **POST** | `/user/register` | ❌ | Create a new user account |
| **POST** | `/user/login` | ❌ | Authenticate and receive JWT |
| **POST** | `/user/verify-otp` | ❌ | Verify OTP for password reset |
| **GET** | `/user/me` | ✅ | Get current user profile |
| **PUT** | `/user/me` | ✅ | Update profile (email, password) |
| **GET** | `/folders` | ✅ | List user folders |
| **POST** | `/folders` | ✅ | Create a new folder |
| **PUT** | `/folders/:id` | ✅ | Rename / move folder |
| **DELETE** | `/folders/:id` | ✅ | Delete folder |
| **POST** | `/files` | ✅ | Upload a small file (multipart) |
| **POST** | `/files/init` | ✅ | Initialise a chunked upload session |
| **POST** | `/chunks` | ✅ | Upload a single chunk |
| **GET** | `/files/:id` | ✅ | Download file metadata / stream |
| **DELETE** | `/files/:id` | ✅ | Delete a file |
| **POST** | `/files/parse-pdf` | ✅ | Extract text & generate AI summary |
| **GET** | `/chunks/status/:sessionId` | ✅ | Check progress of a chunked upload |
| **GET** | `/auth/google` | ❌ | Redirect to Google OAuth flow |
| **GET** | `/logs` | ✅ (admin) | Retrieve recent server logs |
| **GET** | `/health` | ❌ | Simple health‑check JSON |

**Error format**

```json
{
  "message": "Internal Server Error",
  "error": "Detailed error message (only in development)"
}
```

**Rate limiting** – Not yet enforced (planned for v2.0).

---

## Development

### Setting up the workspace

```bash
# Clone (already done) → install dependencies (see above)
# Enable hot‑reload for both sides:
npm run dev   # from server/ (nodemon + tsx)
npm run dev   # from client/ (Vite)
```

### Running Tests

> No test suite is currently shipped. Feel free to add Jest + React Testing Library for unit tests and Supertest for API integration.

### Code Style

* **Frontend** – ESLint (`eslint .`) with React Hooks & Refresh plugins. Prettier can be added via `npm i -D prettier eslint-config-prettier`.
* **Backend** – TypeScript strict mode (`tsconfig.json`). Lint with `eslint .` (if added later).

### Debugging Tips

* Server logs are written to `logs/combined.log` and `logs/error.log`. Use `tail -f logs/combined.log` while developing.
* Vite dev server shows full stack traces in the browser console.
* The global error handler in `server/src/index.ts` logs request path, method, and stack trace.

---

## Deployment

### Docker (recommended for production)

```dockerfile
# Dockerfile (root)
# ---- Build client ----
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# ---- Build server ----
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app
# Copy compiled server
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/package*.json ./
# Copy compiled client static assets
COPY --from=client-builder /app/client/dist ./public

# Install only production deps
RUN npm ci --omit=dev

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```bash
# Build & run
docker build -t novadrive .
docker run -d -p 3000:3000 --env-file server/.env novadrive
```

### Vercel (Frontend)

* Connect the `client/` folder to Vercel.
* Set the `BASE_URL` environment variable in Vercel’s dashboard (or rely on the production detection logic).

### Railway / Render (Backend)

* Deploy the `server/` directory.
* Provide the same `.env` variables via the platform UI.

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. Lint (`npm run lint`) for both client & server.
2. TypeScript compilation (`npm run build`).
3. (Future) Test suites.

Deploy pipelines can be added to push Docker images to a registry and trigger Vercel/Render updates.

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository and **clone** your fork.
2. Create a feature branch: `git checkout -b feat/awesome-feature`.
3. Install dependencies and make sure the app runs locally.
4. Add tests if you introduce new logic (future‑ready).
5. Run lint: `npm run lint` (both client & server).
6. Commit with a clear message and push to your fork.
7. Open a **Pull Request** against `main`.  
   - PR title should follow the conventional commits style (e.g., `feat: add chunked upload support`).  
   - Include a short description of what changed and why.
8. A maintainer will review, request changes if needed, and merge.

### Code of Conduct

Be respectful. Harassment and discrimination are not tolerated. See `CODE_OF_CONDUCT.md` (if added) for details.

---

## Troubleshooting & FAQ

| Issue | Solution |
|-------|----------|
| **Server won’t start – `Cannot find module './config/db.config.js'`** | Ensure you are in the `server/` directory and run `npm run build` first. The compiled files live in `dist/`. |
| **CORS errors in the browser** | Verify that the origin you are testing