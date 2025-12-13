# NovaDrive — Complete Application Flow

## Summary

NovaDrive is a full-stack cloud storage application. The frontend (React + Vite) provides a responsive UI with chunked uploads and folder management. The backend (Node + Express + TypeScript) handles authentication (local + Google OAuth), chunked uploads to Cloudflare R2, deduplication via SHA-256 hashing, background AI processing (BullMQ + Redis + Google Gemini), and email flows (Resend). This document is a single-source reference describing models, client and server flows, APIs, integrations, and operational notes.

## Project Layout (important files)

- Client entry: [client/src/main.jsx](client/src/main.jsx)
- App shell and routes: [client/src/App.jsx](client/src/App.jsx)
- Auth & folder state: [client/src/context/UserContext.jsx](client/src/context/UserContext.jsx), [client/src/context/FolderContext.jsx](client/src/context/FolderContext.jsx)
- Chunk upload hook: [client/src/hooks/useChunkUpload.js](client/src/hooks/useChunkUpload.js)
- Upload UI: [client/src/components/UploadModal.jsx](client/src/components/UploadModal.jsx)
- Server entry: [server/src/index.ts](server/src/index.ts)
- File controllers & routes: [server/src/controllers/file.controller.ts](server/src/controllers/file.controller.ts), [server/src/routes/file.routes.ts](server/src/routes/file.routes.ts)
- Chunk controllers & routes: [server/src/controllers/chunks.controller.ts](server/src/controllers/chunks.controller.ts), [server/src/routes/chunks.routes.ts](server/src/routes/chunks.routes.ts)
- R2 utilities: [server/src/utils/r2.ts](server/src/utils/r2.ts)
- AI & background jobs: [server/src/utils/bullmqJobs.ts](server/src/utils/bullmqJobs.ts)
- Resend/email helper: [server/src/utils/resendController.ts](server/src/utils/resendController.ts)

Refer to those files when you want implementation-level detail.

## Technology Stack

- Frontend: React (Vite), TailwindCSS, Axios, React Router
- Backend: Node.js, Express, TypeScript, Mongoose (MongoDB)
- Background: BullMQ + Redis
- Storage: Cloudflare R2 for object storage (uploads and downloads via presigned URLs)
- AI: Google Gemini (used via the server-side jobs)
- Email: Resend for transactional emails (OTP/password)

## Data Models (summary)

These models are implemented with Mongoose in `server/src/models`.

- User

  - username, email, password (optional for OAuth users), authProvider ('local'|'google'), googleId, avatar, storageQuota, timestamps

- File

  - filename (r2 name), originalName, mimeType, size, hash (SHA-256), r2Key, location (folder reference or null), userId, tags (array), summary, aiStatus ('pending'|'processing'|'completed'|'failed'), timestamps

- Folder

  - name, ownerId, parentFolderId (null for root), timestamps

- Chunk Session

  - sessionId, userId, filename, totalChunks, uploadedChunks, chunkSize, status ('active'|'completed'|'failed'), timestamps

- Hash Registry

  - hash, r2Key, size, mimeType, createdAt — used for deduplication

- OTP
  - email, otpCode, expiresAt, createdAt — used for password reset/verify flows

## Client-Side Flow (detailed)

1. Initialization

   - [client/src/main.jsx](client/src/main.jsx) mounts the React app and wraps the tree with `UserProvider` and `FolderProvider`.
   - `App.jsx` defines public and protected routes and global layout.

2. Authentication

   - `UserContext.jsx` manages JWT tokens in `localStorage`, attaches tokens to Axios requests, and provides login/logout and refresh behavior.
   - Local login/registration call `POST /api/user/login` and `POST /api/user/register`.
   - Google OAuth flow: user is redirected to the backend OAuth endpoint, which performs the exchange and redirects back to the client with tokens handled in [client/src/pages/OAuthPage.jsx](client/src/pages/OAuthPage.jsx).

3. Upload UI and UX

   - Uploads are performed through `UploadModal.jsx` and `useChunkUpload.js`.
   - The hook computes a SHA-256 hash (client-side) to ask the server whether the file already exists (deduplication).
   - If new, the client requests upload initiation, receives a session and presigned URL parameters for chunks, uploads chunks (parallel), then calls upload-complete.
   - UI displays a progress bar (component `ProgressBar.jsx`) and file-level status updates (`StatusMessage.jsx`).

     3.1) AI Search (client)

     - The header/search UI (`client/src/components/Header.jsx`) exposes an `AI Mode` toggle and a search input that debounces user input and calls the server-side AI search endpoint when enabled.
     - When AI mode is enabled the client sends `POST /api/files/ai-search` with `{ query }` and an Authorization header.
     - The client maps `response.data.matches` to a compact result set (fileName, filePath, matchScore) and renders a results dropdown with relevance and quick-preview interactions.
     - The UI waits for results with a loading state and gracefully falls back to local text filtering when AI mode is disabled.

4. Chunking specifics

   - Files are split into configurable chunk sizes (the repo uses ~5MB as default).
   - For each chunk the client requests a presigned URL (`POST /api/chunks/get-presigned-url`) and uploads directly to R2.
   - The client reports chunk results to the server as required by the implementation (session bookkeeping).

5. Deduplication

   - Before uploading, the client sends the SHA-256 hash to `POST /api/chunks/compute-hash-check`.
   - If the `hashModel` has a record, the server can short-circuit the upload and return existing file metadata.

6. Folder UX
   - `FolderContext.jsx` keeps the current folder, supports creation/deletion, and passes folder metadata to the upload flow so files are stored with folder references.

## Server-Side Flow (detailed)

1. Initialization and middleware

   - `server/src/index.ts` configures Express, connects to MongoDB, mounts routes, and applies middlewares such as CORS and `verifyJwt`.
   - Upload size limits and rate limiting are enforced in middleware (`server/src/middleware/uploadLimit.ts`).

2. Authentication

   - `server/src/controllers/user.controller.ts` provides register, login, refresh-token, verify-auth, forgot-password, and change-password endpoints. Passwords are hashed using a secure PBKDF/bcrypt routine.
   - OAuth flow implemented in `server/src/controllers/oAuth.Controller.ts` performs authorization code exchange with Google, upserts the user, and issues JWT tokens.

3. Chunked upload endpoints (high level)

   - `POST /api/chunks/compute-hash-check` — accept client hash, return existing file metadata or OK-to-upload.
   - `POST /api/chunks/upload-initiate` — create a chunk session document that tracks totalChunks, chunkSize, sessionId.
   - `POST /api/chunks/get-presigned-url` — return a presigned R2 URL for a specific chunk index/key.
   - `POST /api/chunks/upload-complete` — validate presence of all chunks, compose/verify file if server-side assembly is required, create `File` metadata record, update `Hash` registry, update user's storage usage, and queue AI processing job(s).

   - `POST /api/files/ai-search` — perform an AI-powered semantic search across a user's files (requires auth). See "AI Search" section for payload and response details.

4. R2 integration

   - `server/src/utils/r2.ts` contains helpers to generate presigned URLs for uploads/downloads and to delete objects. The server uses Cloudflare R2 credentials and account ID to sign requests.

5. Background AI processing (BullMQ)

   - `server/src/utils/bullmqJobs.ts` defines the queue topology: metadata-extraction queue, pdf-processing queue, image-processing queue, and a generic/other queue.
   - Metadata extraction job downloads the object (via presigned download URL), extracts text (pdf-parse, OCR path if needed), or prepares images for analysis.
   - Jobs call Google Gemini APIs to generate tags, summaries, and other insights; results are written back to the `File` document and the `aiStatus` field is updated.

6. AI Search endpoint

   - Route: `POST /api/files/ai-search` (see [server/src/routes/file.routes.ts](server/src/routes/file.routes.ts)).
   - Controller: `aiFileSearch` in [server/src/controllers/file.controller.ts](server/src/controllers/file.controller.ts).
   - Behavior: the controller validates the incoming `{ query }`, loads the user's files (selecting `originalFileName`, `summary`, `tags`, `r2Key`, `mimeType`) and forwards them plus the query to `fileSearch` implemented in [server/src/controllers/gemini.controller.ts](server/src/controllers/gemini.controller.ts).
   - `fileSearch` calls Google Gemini (`gemini-2.5-flash`) and instructs the model to return a pure-JSON payload containing a `matches` array with objects `{ fileName, filePath, matchScore }`. The controller parses that JSON and returns `{ message, query, matches, totalMatches }` to the client.
   - Key rotation & retries: `fileSearch` rotates through multiple Gemini keys (env vars `GEMINI_API_KEY_5`, `GEMINI_API_KEY_6`, `GEMINI_API_KEY_7`) with per-key retries and backoff. Rate-limited keys move to the next key immediately.

   - Example request (client):

     ```json
     { "query": "financial summary Q4 2024" }
     ```

   - Example response (server):

     ```json
     {
       "message": "AI search completed",
       "query": "financial summary Q4 2024",
       "matches": [
         {
           "fileName": "Q4_report.pdf",
           "filePath": "/Finance/Reports/Q4_report.pdf",
           "matchScore": 92
         },
         {
           "fileName": "expenses.csv",
           "filePath": "/Finance/Expenses/expenses.csv",
           "matchScore": 78
         }
       ],
       "totalMatches": 2
     }
     ```

7. Email and OTP

   - `server/src/utils/resendController.ts` integrates with Resend to send OTPs used in password recovery. OTPs are stored in `otpModel` with expiration.

8. Routes and controllers
   - The server separates concerns: each controller (files, chunks, folders, users, otp, oauth) has a corresponding route file under `server/src/routes/` that mounts endpoints under `/api`.

## API Reference (concise list)

- Auth & User

  - `POST /api/user/register` — register
  - `POST /api/user/login` — login
  - `POST /api/user/refresh-token` — refresh access token
  - `GET /api/user/verify-auth` — validate token
  - `POST /api/user/forgot-password` — send OTP
  - `POST /api/user/change-password` — change password

- OAuth

  - `GET /api/oauth/` — start Google OAuth
  - `GET /api/oauth/callback` — handle Google callback and redirect to client

- Chunks & Files

  - `POST /api/chunks/compute-hash-check` — check if hash already exists (dedupe)
  - `POST /api/chunks/upload-initiate` — open upload session
  - `POST /api/chunks/get-presigned-url` — get presigned URL for a chunk
  - `POST /api/chunks/upload-complete` — finalize upload and create file record
  - `GET /api/chunks/upload-status/:sessionId` — query session progress
  - `DELETE /api/chunks/delete-hash-session/:sessionId` — abort / cleanup session
  - `POST /api/chunks/get-download-url` — generate download URL for a stored file
  - `DELETE /api/chunks/delete-file` — delete a stored file (removes metadata and R2 object)

- Files listing

  - `GET /api/files/list-files` — list files for a user/folder with filter and pagination support

- Folders

  - `POST /api/folders/create` — create a folder
  - `GET /api/folders` — list folders (by parent)
  - `DELETE /api/folders/:folderId` — delete a folder (only allowed if empty)

- OTP
  - `POST /api/otp/send` — send one-time code
  - `POST /api/otp/verify` — verify code

## Environment Variables (required)

Create a `.env` in `server/` with values for the following keys used throughout the codebase:

```
# Mongo
MONGODB_URI=

# JWT
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ACCOUNT_ID=
R2_BUCKET_NAME=

# Google Gemini API keys (used for AI jobs and AI Search; multiple keys supported for rotation)
GEMINI_API_KEY_5=
GEMINI_API_KEY_6=
GEMINI_API_KEY_7=

# Redis for BullMQ
REDIS_URL=redis://:password@host:6379

# Resend
RESEND_API_KEY=
```

## File Upload Sequence (chronological)

1. Client computes SHA-256 for selected file (dedupe check).
2. Client calls `POST /api/chunks/compute-hash-check`.
   - If server returns existing file, client can link to existing record: no upload.
3. If new: client calls `POST /api/chunks/upload-initiate` and receives a `sessionId` and session metadata.
4. For each chunk the client requests a presigned URL (`POST /api/chunks/get-presigned-url`) and uploads chunk directly to R2.
5. Client monitors progress and retries failed chunk uploads.
6. Once all chunks succeed, client calls `POST /api/chunks/upload-complete`.
7. Server verifies chunk counts/checksums, creates `File` document, updates `Hash` registry, and publishes a metadata-extraction job to BullMQ.
8. Background jobs process the file, call Gemini for tags/summaries, update `File.aiStatus`, and notify clients through subsequent API reads or websocket events (if implemented).

## AI Processing Details

- Jobs should be idempotent and resilient to worker restarts.
- Metadata extraction differentiates by MIME type: PDFs are text-extracted (pdf-parse), images are prepared for vision analysis, text files are summarized directly.
- Gemini responses are mapped to `tags` (array) and `summary` (string) fields on the `File`.

## Operational notes

- Storage and deduplication: The `hashModel` stores hash→r2Key references; deleting a file should consider whether other file records reference the same `r2Key` before removing the object from R2.
- Security: All presigned URLs are short-lived. JWTs protect API endpoints; keep secrets rotated and secure.
- Scaling: Chunk uploads scale horizontally (uploads go directly to R2). Background processing scales by adding BullMQ workers.

## Developer Quick Start (server)

1. Copy `server/.env.example` (or create `.env`) and fill keys.
2. Install and run services: MongoDB and Redis must be running.
3. From `server/`:

```bash
npm install
npm run dev   # uses ts-node / nodemon as configured
```

## Developer Quick Start (client)

1. From `client/`:

```bash
npm install
npm run dev
```

Open the app in the browser (Vite will print the URL).

## Troubleshooting & tips

- If uploads fail, check CORS and that presigned URL generation in `server/src/utils/r2.ts` uses the correct `R2_ACCOUNT_ID` and `R2_BUCKET_NAME`.
- If AI jobs are not running, ensure Redis is reachable and the worker process for BullMQ is running.
- To debug dedupe edge cases, query `hashModel` in the database to see multiple `File` docs referencing the same `r2Key`.

## Questions & Next Steps
