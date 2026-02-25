# Nova Drive 🚀

![Nova Drive Logo](https://raw.githubusercontent.com/kaihere14/Nova_Drive/main/.github/logo.png)  

**A modern, AI‑enhanced cloud storage platform** – upload, organize, share, and let AI summarize your documents in seconds.

[![Build Status](https://github.com/kaihere14/Nova_Drive/actions/workflows/ci.yml/badge.svg)](https://github.com/kaihere14/Nova_Drive/actions/workflows/ci.yml)  
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)  
[![Version](https://img.shields.io/badge/Version-1.0.0-success)](#)  
[![Node.js](https://img.shields.io/badge/Node-20%2B-green.svg)](https://nodejs.org/)  

[Demo](https://novadrive.space) • [Documentation](https://github.com/kaihere14/Nova_Drive/wiki) • [Issues](https://github.com/kaihere14/Nova_Drive/issues)

---

## Overview

Nova Drive is a full‑stack web application that provides secure file storage, rich folder management, and AI‑powered insights (summarization, OCR, etc.). It supports:

* **User authentication** – JWT, Google OAuth, OTP verification.  
* **Scalable file handling** – uploads to AWS S3 or Cloudinary, background processing with BullMQ/Redis.  
* **AI services** – OpenAI, Google Generative AI, PDF parsing, and custom prompts.  
* **Robust logging & monitoring** – Winston logs, Express‑status‑monitor, health‑check endpoint.

Targeted at developers, startups, and power users who need a self‑hosted, extensible alternative to commercial cloud drives.

Current stable version: **1.0.0** (2026‑02‑25).

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| **File Upload / Download** | Drag‑and‑drop UI, multipart streaming, resumable uploads. | ✅ Stable |
| **Folder Hierarchy** | Nested folders, breadcrumb navigation, move/copy actions. | ✅ Stable |
| **User Management** | Register, login, password reset, JWT auth, Google OAuth. | ✅ Stable |
| **OTP Verification** | Email‑based one‑time passwords for added security. | ✅ Stable |
| **AI Summarization** | Generate concise summaries for PDFs & text files using OpenAI & Google AI. | 🟡 Beta |
| **Background Jobs** | Chunked processing, virus scanning, thumbnail generation via BullMQ & Redis. | ✅ Stable |
| **Real‑time Monitoring** | Express‑status‑monitor dashboard, health endpoint (`/health`). | ✅ Stable |
| **Logging** | Structured JSON logs (console + rotating files) with Winston. | ✅ Stable |
| **Responsive UI** | TailwindCSS + Framer Motion, mobile‑first design. | ✅ Stable |
| **Docker Support** | Ready‑to‑run containers for dev & production. | 🟡 Experimental |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 7, TailwindCSS 4, Framer Motion, Axios, React Router 7, Lucide‑React |
| **Backend** | Node.js 20, Express 4, TypeScript 5, MongoDB (Mongoose 8), Redis (ioredis), BullMQ |
| **Storage** | AWS S3, Cloudinary |
| **AI / ML** | OpenAI SDK, @google/generative‑ai, @google/genai |
| **Auth** | JSON Web Tokens, Google OAuth, bcrypt, OTP via Resend |
| **Logging & Monitoring** | Winston, express‑status‑monitor |
| **CI/CD** | GitHub Actions (CI + Deploy), Vercel (frontend), Docker (backend) |
| **Testing** | (none yet – contributions welcome) |
| **Other** | Multer (multipart handling), Busboy, PDF‑parse, UUID, dotenv |

---

## Architecture

```
root
├─ client/               # React SPA (Vite)
│   ├─ src/              # components, pages, hooks, context
│   └─ public/           # static assets
├─ server/               # Express API (TypeScript)
│   ├─ src/
│   │   ├─ config/       # DB & env config
│   │   ├─ controllers/  # request handlers
│   │   ├─ middleware/   # auth, error handling, etc.
│   │   ├─ models/       # Mongoose schemas
│   │   ├─ routes/       # API endpoints
│   │   └─ utils/        # helpers, BullMQ jobs, logger
│   └─ tsconfig.json
├─ .github/workflows/    # CI/CD pipelines
└─ docker-compose.yml    # (optional) dev/prod containers
```

* **Client ↔ Server** – All API calls go through `client/src/config.js` which selects the correct base URL (`/api/...`).  
* **Background Workers** – BullMQ queues (`workers`, `queues`) process heavy tasks (file chunking, AI summarization) in separate processes.  
* **Graceful Shutdown** – Listeners for `SIGTERM`, `SIGINT`, uncaught exceptions, and unhandled rejections ensure clean resource cleanup.

---

## Getting Started

### Prerequisites

| Tool | Minimum Version |
|------|-----------------|
| Node.js | 20.x |
| npm | 10.x (or Yarn) |
| Docker **(optional)** | 24.x |
| MongoDB | 6.x (local or Atlas) |
| Redis | 7.x |
| AWS S3 bucket | – |
| Cloudinary account | – |
| Google Cloud project (GenAI) | – |
| OpenAI API key | – |
| Resend (email) API key | – |

### Clone the repository

```bash
git clone https://github.com/kaihere14/Nova_Drive.git
cd Nova_Drive
```

### Environment variables

Create two `.env` files – one for the server (`server/.env`) and one for the client (`client/.env`). Example templates are provided below.

#### `server/.env`

```dotenv
# Core
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/novadrive

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=sk-...

# Google Generative AI
GOOGLE_API_KEY=your_google_api_key

# Resend (email OTP)
RESEND_API_KEY=your_resend_key

# JWT
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Misc
CORS_ORIGINS=https://www.novadrive.space,http://localhost:5173
```

#### `client/.env`

```dotenv
VITE_APP_BASE_URL=http://localhost:3000   # matches server URL in dev
VITE_APP_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
```

> **Note**: Vite prefixes all client‑side env vars with `VITE_`. Do **not** commit any `.env*` files.

### Install dependencies

```bash
# Install server deps
cd server
npm ci

# Install client deps
cd ../client
npm ci
```

### Run locally (development)

```bash
# Terminal 1 – Backend (TypeScript -> compiled on the fly)
cd server
npm run dev   # uses nodemon + tsx

# Terminal 2 – Frontend
cd ../client
npm run dev   # Vite dev server (http://localhost:5173)
```

Open `http://localhost:5173` in your browser. The UI will proxy API calls to `http://localhost:3000`.

### Build for production

```bash
# Backend
cd server
npm run build   # tsc → ./dist
npm start       # node dist/index.js

# Frontend
cd ../client
npm run build   # creates ./dist
# Serve with any static server, e.g. Vercel, Netlify, or Docker:
npm install -g serve
serve -s dist
```

### Docker (optional)

A minimal `docker-compose.yml` is provided for quick spin‑up:

```yaml
version: "3.9"
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo-data:/data/db"]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  server:
    build: ./server
    env_file: ./server/.env
    depends_on: [mongo, redis]
    ports: ["3000:3000"]

  client:
    build: ./client
    env_file: ./client/.env
    ports: ["5173:80"]
    depends_on: [server]

volumes:
  mongo-data:
```

```bash
docker compose up --build
```

---

## Usage

### Authentication

```bash
# Register
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"StrongPass123"}'

# Login (returns JWT)
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"StrongPass123"}'
```

Include the token in subsequent requests:

```bash
export TOKEN=$(cat token.txt)   # assume you stored it
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/files
```

### Upload a file

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf"
```

The request returns a file ID. The server will enqueue a background job to generate a preview, extract text, and (if enabled) run AI summarization.

### Retrieve a file

```bash
curl -O http://localhost:3000/api/files/<fileId>/download \
  -H "Authorization: Bearer $TOKEN"
```

### AI Summarization (example)

```bash
curl -X POST http://localhost:3000/api/files/<fileId>/summarize \
  -H "Authorization: Bearer $TOKEN"
```

Response:

```json
{
  "summary": "This PDF discusses the impact of renewable energy..."
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "healthy",
  "timestamp": "2026-02-25T12:34:56.789Z",
  "uptime": 123.45
}
```

---

## API Documentation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/user/register` | Create a new account | ❌ |
| `POST` | `/api/user/login` | Authenticate and receive JWT | ❌ |
| `POST` | `/api/otp/verify` | Verify OTP for email actions | ❌ |
| `GET` | `/api/user/me` | Get current user profile | ✅ |
| `GET` | `/api/files` | List user files | ✅ |
| `POST` | `/api/files/upload` | Upload a new file (multipart) | ✅ |
| `GET` | `/api/files/:id/download` | Download file by ID | ✅ |
| `POST` | `/api/files/:id/summarize` | Generate AI summary (PDF/Text) | ✅ |
| `GET` | `/api/folders` | List folders | ✅ |
| `POST` | `/api/folders` | Create a new folder | ✅ |
| `PUT` | `/api/folders/:id` | Rename/move folder | ✅ |
| `DELETE` | `/api/folders/:id` | Delete folder | ✅ |
| `GET` | `/api/chunks/:id/status` | Check background job status | ✅ |
| `GET` | `/api/auth/google` | Initiate Google OAuth flow | ❌ |
| `GET` | `/api/logs` | Retrieve recent logs (admin) | ✅ (admin) |
| `GET` | `/health` | Service health check | ❌ |

**Error format**

```json
{
  "message": "Internal Server Error",
  "error": "Detailed error message (only in development)"
}
```

Rate limits are enforced per IP (100 requests/minute) via `express-rate-limit` (future enhancement).

---

## Development

### Code style & linting

```bash
# Frontend
cd client
npm run lint

# Backend (TS)
cd ../server
npx eslint . --ext .ts,.js
```

### Running tests

> No test suite is currently bundled. Feel free to add Jest/Mocha tests and run `npm test`.

### Debugging

* Backend logs are written to `logs/combined.log` (info) and `logs/error.log` (errors).  
* Use `DEBUG=express:*` to enable Express debug output.  
* Frontend: Vite dev server provides source‑map hot‑reloading.

### Adding a new API route

1. Create a controller in `server/src/controllers/`.  
2. Add a route file in `server/src/routes/`.  
3. Register the route in `server/src/index.ts`.  
4. Write unit tests (recommended).  

---

## Deployment

### Vercel (Frontend)

1. Connect the `client/` folder to Vercel.  
2. Set the environment variable `VITE_APP_BASE_URL` to your production API URL.  
3. Vercel will run `npm install && npm run build`.

### Render / Railway / Fly.io (Backend)

1. Deploy the `server/` directory as a Node service.  
2. Provide all environment variables listed in `server/.env.example`.  
3. Ensure the service runs `npm run build && npm start`.  
4. Attach a MongoDB and Redis instance (managed services are recommended).

### Docker (Self‑hosted)

```bash
docker build -t novadrive-server ./server
docker build -t novadrive-client ./client

docker run -d -p 3000:3000 --env-file server/.env novadrive-server
docker run -d -p 80:80 --env-file client/.env novadrive-client
```

**Performance tips**

* Enable HTTP/2 on your reverse proxy (NGINX, Caddy).  
* Use CloudFront or another CDN in front of S3 for static assets.  
* Scale BullMQ workers horizontally if processing load spikes.

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository and create a feature branch.  
   ```bash
   git checkout -b feat/awesome-feature
   ```
2. **Install** the project locally (see *Getting Started*).  
3. **Make** your changes. Keep the code style consistent with existing files.  
4. **Run** linting (`npm run lint`) and ensure no TypeScript errors.  
5. **Write** tests for new functionality (Jest, React Testing Library, Supertest).  
6. **Commit** with a clear message and open a Pull Request against `main`.  

### Code Review Guidelines

* All PRs must pass CI (lint + TypeScript compile).  
* Provide a description of the change and, if applicable, update the README.  
* Keep the public API stable; deprecate only with a major version bump.  

### Issues

* Search existing issues before opening a new one.  
* Include steps to reproduce, expected behavior, and screenshots if UI‑related.  

---

## Roadmap

- **v1.1** – Real‑time