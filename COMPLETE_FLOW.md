# NovaDrive - Complete Application Flow Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [File Upload Flow](#file-upload-flow)
4. [File Management Flow](#file-management-flow)
5. [AI Processing Flow](#ai-processing-flow)
6. [Data Models](#data-models)
7. [API Endpoints](#api-endpoints)
8. [Security & Token Management](#security--token-management)

---

## Architecture Overview

### Technology Stack

**Frontend:**

- React 18 with Vite
- Tailwind CSS for styling
- Lucide React for icons
- Axios for HTTP requests
- React Router for navigation

**Backend:**

- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- Cloudflare R2 for cloud storage
- BullMQ for job queues
- JWT for authentication

**Deployment:**

- Client: Vercel
- Server: Running on custom server/Vercel
- Database: MongoDB Atlas
- Storage: Cloudflare R2

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          NovaDrive System                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│    Frontend (React)      │         │   Backend (Node.js)      │
│  - Authentication Pages  │◄───────►│  - Auth Controllers      │
│  - File Upload/Download  │         │  - Upload Controllers    │
│  - Dashboard/Profile     │         │  - File Management       │
│  - File List Display     │         │  - AI Processing Jobs    │
└──────────────────────────┘         └──────────────────────────┘
         │                                    │
         │                            ┌───────┴────────┐
         │                            │                │
         │                    ┌───────▼──────┐   ┌────▼──────────┐
         │                    │  MongoDB     │   │  Cloudflare R2│
         │                    │  - Users     │   │  - File Data  │
         │                    │  - Files     │   │  - Chunks     │
         │                    │  - Sessions  │   │  - Multipart  │
         │                    └──────────────┘   └───────────────┘
         │
    ┌────▼─────────────┐
    │  Vercel (Client) │
    └──────────────────┘
```

---

## Authentication Flow

### 1. Registration Flow

**Steps:**

1. User fills registration form (name, email, password)
2. Frontend sends POST request to `/api/user/register`
3. Server validates input and checks for existing user
4. Server creates new User document with hashed password (bcrypt)
5. Server generates JWT tokens (accessToken: 15min, refreshToken: 7d)
6. Tokens stored in localStorage on frontend
7. User context updated with user data
8. Redirect to dashboard

**Code Path:**

```
Client: SignupPage.jsx → UserContext.register()
  ↓
Server: POST /api/user/register → user.controller.createUser()
  ↓
Database: Save new User to MongoDB
  ↓
Server: Generate tokens → return { user, accessToken, refreshToken }
  ↓
Client: Store tokens in localStorage, update UserContext
```

### 2. Login Flow

**Steps:**

1. User enters email and password
2. Frontend sends POST request to `/api/user/login`
3. Server finds user by email
4. Server compares password with bcrypt hash
5. On match, generates new JWT tokens
6. Tokens stored in localStorage
7. User data cached in React context
8. Redirect to upload page

**Code Path:**

```
Client: LoginPage.jsx → UserContext.login()
  ↓
Server: POST /api/user/login → user.controller.loginUser()
  ↓
Database: Find user by email, verify password
  ↓
Server: Generate tokens → return { user, accessToken, refreshToken }
  ↓
Client: Store tokens, redirect to /upload
```

### 3. Token Refresh Flow

**Automatic Token Refresh on 401:**

```
Client makes API request with accessToken
  ↓
[IF 401 Response]
  ↓
Axios Interceptor triggered
  ↓
Check refreshToken in localStorage
  ↓
[IF refreshToken exists]
  ↓
Send POST /api/user/refresh-token
  ↓
Server verifies refreshToken, generates new accessToken & refreshToken
  ↓
Client updates localStorage with new tokens
  ↓
Retry original request with new accessToken
  ↓
[IF refreshToken expired/missing]
  ↓
Clear tokens, show "Session expired" message
  ↓
Redirect to login
```

**Code Implementation:**

- Location: `client/src/context/UserContext.jsx` (lines 17-95)
- Axios interceptor setup in `useEffect`
- Handles concurrent refresh requests with promise queue
- Shows loading indicator if refresh takes > 400ms
- Auto-retry failed requests after token refresh

### 4. Auth Check on App Load

**Steps:**

1. App mounts → UserProvider initializes
2. `checkAuth()` runs on context mount
3. Checks for accessToken and refreshToken in localStorage
4. If no accessToken but refreshToken exists → triggers refresh
5. Makes GET request to `/api/user/verify-auth` with accessToken
6. Server returns user data (excludes password)
7. User context updated, loading screen removed
8. Routes rendered

---

## File Upload Flow

### Complete Upload Process

```
1. USER SELECTS FILE
   ↓
2. FILE VALIDATION & HASHING
   - Compute SHA-256 hash of first 4MB
   - Calculate total chunks (5MB each)
   ↓
3. DUPLICATE CHECK
   - Send hash to server
   - Server checks MongoDB for existing hash
   - If exists & not expired (5 min): skip upload
   ↓
4. UPLOAD INITIATION
   - Server creates multipart upload in R2
   - Stores upload session in MongoDB
   - Returns uploadId, key, sessionId
   ↓
5. PARALLEL CHUNK UPLOAD (4 chunks at a time)
   - Get presigned URLs for 4 chunks
   - Upload chunks directly to R2
   - Collect ETags from response
   ↓
6. COMPLETION & PROCESSING
   - Send parts & ETags to server
   - Server completes multipart upload
   - Create File document in MongoDB
   - Queue AI processing job
   ↓
7. POLLING (3 attempts: 3s, 5s, 7s)
   - Frontend polls file list API
   - Checks aiStatus field
   - Updates UI when processing completes
```

### Detailed Steps with Code

**Step 1: File Selection & Hashing**

```javascript
// useChunkUpload.js - handleFileChange()
- Read file from input
- Calculate total chunks needed (size / 5MB)
- computeHash(): SHA-256 of first 4MB chunk
```

**Step 2: Duplicate Check**

```
Client: POST /api/chunks/compute-hash-check
  ↓
Server: chunks.controller.computeHashCheck()
  ↓
MongoDB: Find Hash document with fileHash
  ↓
[IF found & < 5 min old]
  Return { exists: true, sessionId }
  Skip to step 7
  ↓
[IF found & > 5 min old]
  Delete expired hash
  Return { exists: false }
  Continue to step 4
```

**Step 3: Upload Initiation**

```
Client: POST /api/chunks/upload-initiate
  Payload: { userId, fileName, fileSize, totalChunks, fileHash, ... }
  ↓
Server: chunks.controller.uploadInitiate()
  ├─ Create R2 multipart upload → r2CreateMultipart()
  ├─ Create chunk session document in MongoDB
  └─ Return { uploadSessionId, uploadId, key }
  ↓
Client: Store sessionId for later use
```

**Step 4: Parallel Chunk Upload**

```
For each batch of 4 chunks:
  ├─ Client: POST /api/chunks/get-presigned-url (x4)
  │  Payload: { key, uploadId, PartNumber }
  │  ↓
  │  Server: r2GetPresignedUrl() → returns signed URL
  │  ↓
  │  Client: Receives 4 presigned URLs
  │
  ├─ Client: Fetch PUT to presigned URL (x4 parallel)
  │  ├─ Upload chunk binary to R2
  │  ├─ Response includes ETag header
  │  └─ Store { partNumber, ETag }
  │
  └─ Update progress bar: (uploadedChunks / totalChunks) * 100
```

**Step 5: Completion**

```
Client: POST /api/chunks/upload-complete
  Payload: {
    sessionId,
    uploadId,
    key,
    parts: [{ partNumber: 1, ETag: "abc..." }, ...],
    fileName,
    mimeType,
    size
  }
  ↓
Server: chunks.controller.completeUpload()
  ├─ Verify all parts present
  ├─ Call r2CompleteMultipart() → finalizes R2 upload
  ├─ Create File document in MongoDB:
  │  ├─ owner: userId
  │  ├─ originalFileName
  │  ├─ r2Key: full path in R2
  │  ├─ size, mimeType
  │  ├─ aiStatus: "pending"
  │  └─ tags: [], summary: ""
  │
  ├─ Queue AI job: extractData() → BullMQ
  ├─ Delete hash session: DELETE /api/chunks/delete-hash-session/{sessionId}
  └─ Return { success: true, location, key }
  ↓
Client: setUploadStatus("Upload complete!")
  └─ Close modal after 1.5s
  └─ Trigger filesListRef.startPolling()
```

**Step 6: Polling for AI Status**

```
After upload completes:
  ├─ Immediately: fetchFiles() with loading UI
  ├─ After 3s: fetchFiles(silent=true)
  ├─ After 5s: fetchFiles(silent=true)
  ├─ After 7s: fetchFiles(silent=true)
  │
  └─ Each fetch checks file.aiStatus:
     - "pending" → show yellow badge
     - "processing" → show blue badge
     - "completed" → show tags & summary
     - "failed" → show red badge
```

---

## File Management Flow

### Download File

```
User clicks Download button on file
  ↓
Client: POST /api/chunks/get-download-url
  Payload: { key, filename, userId }
  ↓
Server: chunks.controller
  ├─ Verify file ownership
  ├─ Call r2GetPresignedUrl() → 60-second expiring URL
  └─ Return { url }
  ↓
Client: window.location.href = presignedUrl
  ↓
Browser downloads file directly from R2
```

### Share File

```
User clicks Share button
  ↓
Modal opens with share options
  ↓
Same as Download flow above
  ↓
Modal displays presigned URL
  ├─ Copy button copies URL to clipboard
  └─ Link expires in 60 seconds
```

### Delete File

```
User clicks Delete → confirms action
  ↓
Client: DELETE /api/chunks/delete-file
  Payload: { key, userId }
  ↓
Server: chunks.controller.deleteFile()
  ├─ Verify file ownership
  ├─ Delete File document from MongoDB
  ├─ Delete file from R2 bucket
  └─ Return { success: true }
  ↓
Client: Refresh file list via fetchFiles()
```

### List Files

```
UploadPage mounts or user navigates to files
  ↓
Client: GET /api/files/list-files
  Headers: { Authorization: Bearer <token> }
  ↓
Server: file.controller.listFiles()
  ├─ Extract userId from JWT token
  ├─ Query MongoDB: FileModel.find({ owner: userId })
  ├─ Sort by createdAt descending
  └─ Return array of files with all metadata
  ↓
Client: setFiles(response.data.files)
  ├─ Display file list
  ├─ Show storage usage: sum of file.size
  ├─ Show AI processing status per file
  └─ Render download/share/delete buttons
```

---

## AI Processing Flow

### Job Queue System

**Technology:** BullMQ with Redis

- Queue name: `extractData`
- Triggered after file upload completes
- Processes files asynchronously

### AI Processing Steps

```
1. FILE UPLOAD COMPLETES
   ↓
2. SERVER QUEUES JOB
   Job payload: {
     fileId,
     fileName,
     mimeType,
     r2Key,
     userId
   }
   ↓
3. WORKER PROCESSES JOB
   ├─ Fetch file from R2
   ├─ Parse/extract content based on mimeType
   ├─ Call AI service (Google Genai/Generative AI)
   ├─ Extract:
   │  ├─ Tags/Categories
   │  ├─ Summary
   │  └─ Metadata
   │
   ├─ Update File document:
   │  ├─ aiStatus: "completed"
   │  ├─ tags: [...]
   │  ├─ summary: "..."
   │  └─ processedAt: Date
   │
   └─ Mark job as complete
   ↓
4. FRONTEND POLLING DETECTS UPDATE
   ├─ fetchFiles() returns updated file
   ├─ file.aiStatus === "completed"
   ├─ Stops polling
   ├─ Displays tags and summary
   └─ Updates UI
```

### Job States

- **Pending**: File uploaded, waiting for processing
- **Processing**: AI is analyzing file
- **Completed**: AI analysis finished, tags/summary available
- **Failed**: Error during AI processing

---

## Data Models

### User Model

```typescript
interface IUser {
  _id: ObjectId
  username: string           // Unique username
  email: string             // Unique email
  password: string          // Bcrypt hashed
  storageQuota: number      // Default: 10GB
  storageUsed: number       // Sum of file sizes
  createdAt: Date
  updatedAt: Date
}

Schema: {
  username: { type: String, unique: true, required: true }
  email: { type: String, unique: true, required: true }
  password: { type: String, required: true } // hashed
  storageQuota: { type: Number, default: 10 * 1024 * 1024 * 1024 }
  storageUsed: { type: Number, default: 0 }
  createdAt: { type: Date, default: Date.now }
  updatedAt: { type: Date, default: Date.now }
}
```

### File Model

```typescript
interface IFile {
  _id: ObjectId
  owner: ObjectId           // Reference to User
  originalFileName: string  // User-provided filename
  mimeType: string         // e.g., "application/pdf"
  size: number             // File size in bytes

  // Cloudflare R2 storage
  bucket: string           // R2 bucket name
  r2Key: string           // Full path: uploads/{userId}/{hash}+{timestamp}
  etag: string            // Multipart upload ETag
  versionId: string       // R2 version ID

  // AI Processing
  aiStatus: "pending" | "processing" | "completed" | "failed"
  tags: string[]          // Categories extracted by AI
  summary: string         // Summary extracted by AI

  createdAt: Date
  updatedAt: Date
}

Schema: {
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  originalFileName: { type: String, required: true }
  mimeType: { type: String, required: true }
  size: { type: Number, required: true }
  bucket: { type: String }
  r2Key: { type: String, required: true }
  etag: { type: String }
  versionId: { type: String }
  aiStatus: { type: String, default: 'pending' }
  tags: [{ type: String }]
  summary: { type: String, default: '' }
  createdAt: { type: Date, default: Date.now }
  updatedAt: { type: Date, default: Date.now }
}
```

### Upload Session Model (Chunks)

```typescript
interface IChunk {
  _id: ObjectId
  userId: string           // Owner user ID
  uploadId: string        // R2 multipart upload ID
  fileName: string        // Original filename
  fileSize: number        // Total file size
  contentType: string
  totalChunks: number     // How many chunks total
  chunkSize: number       // Size per chunk (5MB)
  status: "initiated" | "uploading" | "completed"
  expiresAt: Date        // Session expires in 24 hours
  createdAt: Date
}

Schema: {
  userId: { type: String, required: true }
  uploadId: { type: String, required: true }
  fileName: { type: String, required: true }
  fileSize: { type: Number, required: true }
  contentType: { type: String, required: true }
  totalChunks: { type: Number, required: true }
  chunkSize: { type: Number, required: true }
  status: { type: String, default: 'initiated' }
  expiresAt: { type: Date }
  createdAt: { type: Date, default: Date.now }
}
```

### Hash Model (Deduplication)

```typescript
interface IHash {
  _id: ObjectId
  fileHash: string        // SHA-256 hash of first 4MB
  sessionId: string       // Reference to upload session
  createdAt: Date
  ttl: number            // Auto-delete after 5 minutes
}

Schema: {
  fileHash: { type: String, unique: true, required: true }
  sessionId: { type: String, required: true }
  createdAt: { type: Date, default: Date.now, expires: 300 } // TTL: 5 min
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/user/register`

Create new user account

**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**

```json
{
  "message": "User created successfully",
  "newUser": { "_id": "...", "username": "...", "email": "..." },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### POST `/api/user/login`

Authenticate user and get tokens

**Request:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": { "_id": "...", "username": "...", "email": "..." },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### GET `/api/user/verify-auth`

Verify current session and get user data

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response (200):**

```json
{
  "_id": "...",
  "username": "...",
  "email": "...",
  "storageQuota": 10737418240,
  "storageUsed": 5368709120,
  "createdAt": "2025-12-04T..."
}
```

#### POST `/api/user/refresh-token`

Get new access token using refresh token

**Request:**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### GET `/api/user/profile`

Get user profile (same as verify-auth)

**Headers:**

```
Authorization: Bearer <accessToken>
```

#### PUT `/api/user/profile`

Update user profile

**Request:**

```json
{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

#### DELETE `/api/user/delete`

Delete user account and all files

**Headers:**

```
Authorization: Bearer <accessToken>
```

---

### Upload Endpoints

#### POST `/api/chunks/compute-hash-check`

Check if file with same hash exists (deduplication)

**Request:**

```json
{
  "fileHash": "abc123def456..."
}
```

**Response (200):**

```json
{
  "exists": false,
  "expired": false
}
// OR
{
  "exists": true,
  "sessionId": "upload_session_id"
}
```

#### POST `/api/chunks/upload-initiate`

Initiate multipart upload session

**Request:**

```json
{
  "userId": "user_id",
  "fileName": "document.pdf",
  "fileSize": 5242880,
  "contentType": "application/pdf",
  "totalChunks": 2,
  "chunkSize": 5242880,
  "fileHash": "abc123..."
}
```

**Response (201):**

```json
{
  "message": "Upload session initiated",
  "uploadSessionId": "session_id",
  "uploadId": "r2_upload_id",
  "key": "uploads/user_id/hash+timestamp"
}
```

#### POST `/api/chunks/logging-hash`

Log file hash for deduplication tracking

**Request:**

```json
{
  "fileHash": "abc123...",
  "sessionId": "session_id"
}
```

#### POST `/api/chunks/get-presigned-url`

Get presigned URL for chunk upload to R2

**Request:**

```json
{
  "key": "uploads/user_id/hash+timestamp",
  "uploadId": "r2_upload_id",
  "PartNumber": 1
}
```

**Response (200):**

```json
{
  "url": "https://r2bucket.com/...?X-Amz-Algorithm=..."
}
```

#### POST `/api/chunks/upload-complete`

Complete multipart upload after all chunks uploaded

**Request:**

```json
{
  "sessionId": "session_id",
  "uploadId": "r2_upload_id",
  "key": "uploads/user_id/hash+timestamp",
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 5242880,
  "parts": [
    { "partNumber": 1, "ETag": "abc123..." },
    { "partNumber": 2, "ETag": "def456..." }
  ]
}
```

**Response (200):**

```json
{
  "success": true,
  "result": {
    "Location": "https://r2bucket.com/uploads/...",
    "Bucket": "novadrive-bucket",
    "Key": "uploads/user_id/hash+timestamp",
    "ETag": "abc123-2"
  },
  "location": "...",
  "key": "uploads/user_id/hash+timestamp"
}
```

#### DELETE `/api/chunks/delete-hash-session/{sessionId}`

Clean up hash session after upload

**Response (200):**

```json
{
  "message": "Hash session deleted successfully"
}
```

#### POST `/api/chunks/upload-status/{sessionId}`

Get current upload session status

**Response (200):**

```json
{
  "status": "completed",
  "totalChunks": 2,
  "uploadId": "r2_upload_id"
}
```

---

### File Management Endpoints

#### GET `/api/files/list-files`

List all files for current user

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response (200):**

```json
{
  "files": [
    {
      "_id": "file_id",
      "owner": "user_id",
      "originalFileName": "document.pdf",
      "mimeType": "application/pdf",
      "size": 5242880,
      "r2Key": "uploads/user_id/hash+timestamp",
      "aiStatus": "completed",
      "tags": ["document", "important"],
      "summary": "This is a summary...",
      "createdAt": "2025-12-04T..."
    }
  ]
}
```

#### POST `/api/chunks/get-download-url`

Generate temporary download URL for file

**Request:**

```json
{
  "key": "uploads/user_id/hash+timestamp",
  "filename": "document.pdf",
  "userId": "user_id"
}
```

**Response (200):**

```json
{
  "url": "https://r2bucket.com/...?X-Amz-Algorithm=...expires=60s"
}
```

#### DELETE `/api/chunks/delete-file`

Delete a file permanently

**Request:**

```json
{
  "key": "uploads/user_id/hash+timestamp",
  "userId": "user_id"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Security & Token Management

### JWT Configuration

**Access Token:**

- Duration: 15 minutes
- Payload: `{ userId, iat, exp }`
- Used in: Authorization header for protected routes
- Storage: localStorage

**Refresh Token:**

- Duration: 7 days
- Payload: `{ userId, iat, exp }`
- Used in: Refresh token endpoint only
- Storage: localStorage
- Rotation: New token issued on each refresh

### Password Security

- **Hashing:** bcrypt with salt rounds (default: 10)
- **Comparison:** bcrypt.compare() for login
- **Never transmitted:** Password excluded from API responses
- **Never logged:** Excluded from database queries

### CORS Configuration

```typescript
{
  origin: "*",  // Production should restrict to client domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}
```

### Request Authentication

All protected endpoints require:

```
Authorization: Bearer <accessToken>
```

Extracted via `verifyJwt` middleware:

```typescript
// Middleware extracts userId from JWT token
// Attaches to request: (req as any).userId
```

### 401 Handling Flow

```
API Request with expired accessToken
  ↓
Server returns 401
  ↓
Axios interceptor catches error
  ↓
Check if refreshToken exists
  ├─ YES: Send refresh request
  │  ├─ Get new accessToken & refreshToken
  │  ├─ Update localStorage
  │  ├─ Retry original request with new token
  │  └─ Return response
  │
  └─ NO: Redirect to login
     └─ Clear tokens
     └─ Show session expired message
```

### Token Storage

**localStorage Keys:**

- `accessToken` - Short-lived auth token
- `refreshToken` - Long-lived refresh token

**Why localStorage:**

- Persists across page refreshes
- Accessible to JavaScript
- Tokens included in requests via Axios interceptor

---

## Client Component Architecture

### Page Components

**HomePage.jsx**

- Landing page with features overview
- Links to signup/login
- Pricing information

**LoginPage.jsx**

- Email/password form
- Calls UserContext.login()
- Redirects to /upload on success

**SignupPage.jsx**

- Registration form (name, email, password)
- Calls UserContext.register()
- Redirects to /upload on success

**UploadPage.jsx**

- Main dashboard after login
- Contains:
  - Sidebar (navigation, storage info)
  - Header (search, user menu)
  - Upload modal
  - FilesList component (with ref for polling)
- Manages:
  - activeView state (files, recent, favorites, trash)
  - searchQuery state
  - storageInfo state
  - Upload polling trigger

**ProfilePage.jsx**

- User account information
- Stats (files, storage, joined date)
- Account actions (edit, delete)
- Reads from UserContext

### Components

**FilesList.jsx**

- Displays list of user's files
- Features:
  - Table view (desktop) & card view (mobile)
  - File filtering (by view type & search)
  - Tag-based filtering
  - Download/Share/Delete buttons
  - AI processing status badges
  - Storage statistics
- Uses forwardRef for polling trigger
- Methods:
  - `refresh()` - Manual file list refresh
  - `startPolling()` - Start 3-attempt polling

**UploadButton.jsx**

- File input and upload UI
- Shows progress during upload
- Displays processing status
- Manages file selection

**ProgressBar.jsx**

- Visual progress indicator
- Shows percentage complete
- Animated bar fill

**StatusMessage.jsx**

- Upload status messages
- Success/error/processing states

**LoadingScreen.jsx**

- Full-screen loading indicator
- Shows custom message
- Spinner animation

**Navbar.jsx** (likely in UploadPage)

- Header with search
- User profile dropdown
- Navigation buttons

---

## Flow Diagram: Complete User Journey

```
NEW USER JOURNEY
================

1. User visits NovaDrive.space
   ↓
2. Clicks "Get Started" → /signup
   ↓
3. Enters email, password, name → Register
   ├─ POST /api/user/register
   ├─ MongoDB: Create User + Hash password
   ├─ Return tokens + user data
   └─ Store in localStorage + UserContext
   ↓
4. Redirected to /upload (dashboard)
   ├─ UploadPage loads
   ├─ checkAuth() verifies tokens
   └─ FilesList displays empty
   ↓
5. Clicks "Upload New File"
   ├─ Modal opens
   └─ Select file
   ↓
6. File Upload Process (described above)
   ├─ Hash check (deduplication)
   ├─ Initiate multipart session
   ├─ Parallel chunk uploads (4 at a time)
   ├─ Complete multipart
   ├─ Create File document
   └─ Queue AI processing job
   ↓
7. UI shows "Upload complete!"
   ├─ Modal closes after 1.5s
   └─ Start polling
   ↓
8. Polling (3 attempts)
   ├─ 3 seconds: fetchFiles() - still "pending"
   ├─ 5 seconds: fetchFiles() - "processing"
   ├─ 7 seconds: fetchFiles() - "completed"
   └─ Stops, shows tags & summary
   ↓
9. User sees file in list
   ├─ Can download
   ├─ Can share
   ├─ Can delete
   └─ Can filter by tags


RETURNING USER JOURNEY
======================

1. User visits NovaDrive.space
   ↓
2. Already logged out, redirects to /login
   ↓
3. Enters email + password → Login
   ├─ POST /api/user/login
   ├─ Server verifies credentials
   └─ Return tokens + user data
   ↓
4. Redirect to /upload
   ├─ FilesList displays all previous files
   ├─ Shows AI-processed metadata (tags, summary)
   └─ Can download, share, delete files


TOKEN EXPIRATION DURING USAGE
==============================

1. User uploads file successfully
   ↓
2. 15 minutes pass (accessToken expires)
   ↓
3. User clicks "Download" on file
   ├─ POST /api/chunks/get-download-url
   ├─ Server returns 401 (expired token)
   └─ Axios interceptor catches
   ↓
4. Auto Token Refresh
   ├─ Check refreshToken (still valid, 7d)
   ├─ POST /api/user/refresh-token
   ├─ Server validates refreshToken
   ├─ Returns new accessToken + new refreshToken
   ├─ localStorage updated
   └─ Show "Refreshing session..." indicator
   ↓
5. Retry original request
   ├─ POST /api/chunks/get-download-url
   ├─ With new accessToken
   └─ Success! Download starts
   ↓
6. User sees smooth experience (no interruption)


SESSION EXPIRED (Both tokens invalid)
=====================================

1. User away for > 7 days
   ↓
2. Returns and makes API request
   ├─ accessToken expired
   ├─ Interceptor checks for refreshToken
   └─ refreshToken also expired
   ↓
3. Auto logout triggered
   ├─ Clear localStorage
   ├─ Set isAuthenticated = false
   ├─ Show "Session expired" banner
   └─ Redirect to /login after 2s
   ↓
4. User must login again
```

---

## Environment Configuration

### Frontend (.env)

```
VITE_API_BASE_URL=https://nova-drive-backend.vercel.app
```

**Client Config** (config.js):

```javascript
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://nova-drive-backend.vercel.app"
    : "https://localhost:3000";
```

### Backend (.env)

```
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/novadrive
JWT_SECRET=your_jwt_secret_key_here
CLOUDFLARE_ACCOUNT_ID=your_cf_account_id
CLOUDFLARE_API_TOKEN=your_cf_api_token
CLOUDFLARE_BUCKET_NAME=novadrive-bucket
REDIS_URL=redis://localhost:6379 (for BullMQ)
GOOGLE_API_KEY=your_google_genai_api_key
```

---

## Performance Optimizations

1. **Parallel Chunk Upload:** 4 chunks uploaded simultaneously
2. **Hash-based Deduplication:** Skip re-uploading identical files
3. **Presigned URLs:** Direct upload to R2, reduces server load
4. **File List Polling:** Only 3 quick checks instead of continuous polling
5. **Token Auto-Refresh:** Seamless experience without manual re-login
6. **Axios Interceptors:** Automatic request/response handling
7. **Silent Polling:** Background file list refresh without UI interruption

---

## Error Handling

### Client-Side

- Try-catch blocks in async functions
- Axios error interceptors for 401/403
- User-friendly error messages
- Fallback UI states

### Server-Side

- Validation on all endpoints
- Proper HTTP status codes (400, 401, 403, 404, 500)
- Detailed error messages in response
- Graceful error handling in async operations

---

## Monitoring & Logging

**Frontend:**

- Console logs for debugging
- User feedback through UI messages

**Backend:**

- Express status monitor at `/status`
- Console logging for errors
- MongoDB query logging

---

This comprehensive flow documentation covers the complete architecture, data flow, API contracts, and user experience of the NovaDrive application.
