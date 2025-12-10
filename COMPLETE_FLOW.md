# NovaDrive - Complete Application Flow Documentation

## Overview

NovaDrive is a modern cloud storage application built with React (frontend) and Node.js/Express (backend) that provides secure file storage with AI-powered organization features. The application supports chunked file uploads, Google OAuth authentication, hierarchical folder management, and automatic AI-generated tags and summaries for uploaded files.

## Architecture

### Technology Stack

**Frontend:**

- React 19.2.0 with Vite build system
- TailwindCSS for styling
- Axios for HTTP requests
- React Router for navigation
- Lucide React for icons

**Backend:**

- Node.js with Express framework
- TypeScript for type safety
- MongoDB with Mongoose ODM
- JWT for authentication
- BullMQ with Redis for job queues

**External Services:**

- Cloudflare R2 for object storage
- Google OAuth 2.0 for authentication
- Google Gemini AI for file analysis
- Resend for email services
- Redis for background job processing

## Database Models

### User Model (`user.model.ts`)

```typescript
{
  username: String,
  email: String,
  password: String, // Optional for OAuth users
  authProvider: String, // 'local' or 'google'
  googleId: String, // For OAuth users
  avatar: String, // Profile picture URL
  storageQuota: Number, // User's storage limit in bytes
  createdAt: Date,
  updatedAt: Date
}
```

### File Model (`fileSchema.model.ts`)

```typescript
{
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  hash: String, // SHA-256 hash for deduplication
  r2Key: String, // Cloudflare R2 object key
  location: ObjectId, // Reference to folder (null for root)
  userId: ObjectId, // Owner reference
  tags: [String], // AI-generated tags
  summary: String, // AI-generated summary
  aiStatus: String, // 'pending', 'processing', 'completed', 'failed'
  createdAt: Date,
  updatedAt: Date
}
```

### Folder Model (`folderModel.ts`)

```typescript
{
  name: String,
  ownerId: ObjectId,
  parentFolderId: ObjectId, // null for root folders
  createdAt: Date,
  updatedAt: Date
}
```

### Chunk Model (`chunk.model.ts`)

```typescript
{
  sessionId: String,
  userId: ObjectId,
  filename: String,
  totalChunks: Number,
  uploadedChunks: Number,
  chunkSize: Number,
  status: String, // 'active', 'completed', 'failed'
  createdAt: Date,
  updatedAt: Date
}
```

### Hash Model (`hashModel.ts`)

```typescript
{
  hash: String,
  r2Key: String,
  size: Number,
  mimeType: String,
  createdAt: Date
}
```

### OTP Model (`otpModel.ts`)

```typescript
{
  email: String,
  otp: String,
  expiresAt: Date,
  createdAt: Date
}
```

## Client-Side Flow

### Application Initialization

**Entry Point:** `main.jsx`

- Renders the React application with BrowserRouter
- Wraps the app with UserProvider and FolderProvider for global state management

**App Structure:** `App.jsx`

- Defines routing structure with protected routes
- Includes UserProvider and FolderProvider context wrappers
- Routes include: Home, Login, Signup, Upload, Profile, OAuth callback, etc.

### Authentication Flow

**UserContext.jsx** manages authentication state:

- JWT token storage in localStorage
- Automatic token refresh on 401 errors
- Axios interceptors for token attachment
- Support for both local and OAuth authentication

**Login Process:**

1. User submits credentials on LoginPage
2. API call to `/api/user/login`
3. JWT tokens stored in localStorage
4. User redirected to upload page

**Google OAuth Flow:**

1. User clicks "Sign in with Google" on LoginPage
2. Redirected to Google OAuth endpoint
3. Google callback handled by OAuthPage component
4. Tokens extracted from URL parameters
5. User authenticated and redirected to upload page

### File Upload Flow

**Chunked Upload Process** (`useChunkUpload.js`):

1. **File Selection:**

   - User selects file in UploadModal
   - File hash computed using SHA-256

2. **Deduplication Check:**

   - API call to `/api/chunks/compute-hash-check`
   - Server checks if file already exists
   - If duplicate found, upload skipped

3. **Upload Initiation:**

   - API call to `/api/chunks/upload-initiate`
   - Server creates upload session
   - Returns session metadata

4. **Chunk Upload:**

   - File split into 5MB chunks
   - Presigned URLs requested for each chunk
   - Chunks uploaded to Cloudflare R2 in parallel
   - Progress tracked and displayed

5. **Upload Completion:**
   - API call to `/api/chunks/upload-complete`
   - Server verifies all chunks uploaded
   - File metadata saved to database
   - AI processing job queued

### Folder Management

**FolderContext.jsx** manages folder navigation:

- Hierarchical folder structure support
- Current folder state management
- Folder creation, deletion, and navigation

**Folder Operations:**

- Create folders with parent-child relationships
- Navigate through folder hierarchy
- Files organized within folders
- Folder deletion (only empty folders)

### File Management

**FilesList.jsx** displays and manages files:

- Lists files with metadata, tags, and summaries
- Search and filter functionality
- File download via presigned URLs
- File deletion with confirmation
- Real-time AI processing status updates

## Server-Side Flow

### Server Initialization

**Entry Point:** `index.ts`

- Express server setup with TypeScript
- CORS configuration for cross-origin requests
- MongoDB connection with Mongoose
- Route mounting for all API endpoints
- Middleware setup (JWT verification, upload limits)

### Authentication Endpoints

**User Controller** (`user.controller.ts`):

- `POST /api/user/register` - User registration with password hashing
- `POST /api/user/login` - Credential verification and JWT generation
- `POST /api/user/refresh-token` - Access token refresh
- `GET /api/user/verify-auth` - Token validation
- `POST /api/user/forgot-password` - OTP email sending
- `POST /api/user/change-password` - Password update

**OAuth Controller** (`oAuth.Controller.ts`):

- `GET /api/oauth/` - Google OAuth redirect
- `GET /api/oauth/callback` - OAuth callback handling
- User creation/lookup for OAuth users
- JWT token generation for OAuth flow

### File Upload Endpoints

**Chunks Controller** (`chunks.controller.ts`):

1. **Hash Check** (`POST /api/chunks/compute-hash-check`):

   - Receives file hash from client
   - Checks hashModel for existing files
   - Returns existing file data or allows upload

2. **Upload Initiation** (`POST /api/chunks/upload-initiate`):

   - Creates new chunk session
   - Returns session ID and upload parameters

3. **Presigned URLs** (`POST /api/chunks/get-presigned-url`):

   - Generates Cloudflare R2 presigned URLs
   - Returns URLs for chunk uploads

4. **Upload Completion** (`POST /api/chunks/upload-complete`):
   - Verifies all chunks uploaded
   - Creates file metadata record
   - Queues AI processing job
   - Updates user storage usage

### Folder Management Endpoints

**Folder Controller** (`folderConrtoller.ts`):

- `POST /api/folders/create` - Create new folder
- `GET /api/folders/` - Get folders by parent
- `DELETE /api/folders/:folderId` - Delete empty folder

### AI Processing Pipeline

**BullMQ Jobs** (`bullmqJobs.ts`):

The application uses multiple AI processing queues:

1. **Metadata Extraction Queue:**

   - Downloads file from R2 using presigned URL
   - Extracts content based on file type:
     - Images: Base64 encoding for AI analysis
     - PDFs: Text extraction using pdf-parse
     - Other files: Filename/MIME type analysis

2. **PDF Processing Queue:**

   - Uses Google Gemini AI to analyze PDF content
   - Generates tags and summaries based on extracted text

3. **Image Processing Queue:**

   - Uses Google Gemini AI for image captioning
   - Generates tags and summaries from visual content

4. **Other Files Queue:**
   - Uses filename and MIME type for basic categorization
   - Generates generic tags and summaries

**AI Processing Flow:**

1. File uploaded successfully
2. Metadata extraction job queued
3. Content extracted and analyzed
4. Appropriate AI processing job queued
5. File metadata updated with tags and summary
6. UI updated with AI-generated information

### Cloudflare R2 Integration

**R2 Utilities** (`utils/r2.ts`):

- Presigned URL generation for uploads
- Presigned URL generation for downloads
- Object deletion from R2 storage

### Email Services

**Resend Integration** (`utils/resendController.ts`):

- OTP email sending for password reset
- Email template formatting
- Error handling for email delivery

## API Endpoints Reference

### Authentication

- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/profile/:userId` - Get user profile
- `POST /api/user/refresh-token` - Refresh access token
- `POST /api/user/forgot-password` - Send password reset OTP
- `POST /api/user/change-password` - Update password
- `GET /api/user/verify-auth` - Verify authentication
- `GET /api/user/total` - Get user statistics

### OAuth

- `GET /api/oauth/` - Google OAuth redirect
- `GET /api/oauth/callback` - OAuth callback

### File Operations

- `POST /api/chunks/compute-hash-check` - Check file hash
- `POST /api/chunks/logging-hash` - Log hash (internal)
- `POST /api/chunks/upload-initiate` - Start upload session
- `POST /api/chunks/get-presigned-url` - Get upload URLs
- `POST /api/chunks/upload-complete` - Complete upload
- `GET /api/chunks/upload-status/:sessionId` - Check upload status
- `DELETE /api/chunks/delete-hash-session/:sessionId` - Clean up session

### File Management

- `GET /api/files/list-files` - List user files
- `POST /api/chunks/get-download-url` - Generate download URL
- `DELETE /api/chunks/delete-file` - Delete file

### Folder Management

- `POST /api/folders/create` - Create folder
- `GET /api/folders/` - List folders
- `DELETE /api/folders/:folderId` - Delete folder

### OTP

- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/novadrive

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/oauth/callback

# Cloudflare R2
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_ACCOUNT_ID=your_r2_account_id
R2_BUCKET_NAME=your_bucket_name

# AI (Google Gemini)
GEMINI_API_KEY_1=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
GEMINI_API_KEY_3=your_gemini_api_key_3
GEMINI_API_KEY_4=your_gemini_api_key_4

# Redis (BullMQ)
REDIS_PASSWORD=your_redis_password

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
```

## Key Features

1. **Chunked Uploads:** Files split into 5MB chunks for reliable uploads
2. **Deduplication:** SHA-256 hashing prevents duplicate file storage
3. **AI-Powered Organization:** Automatic tagging and summarization
4. **Hierarchical Folders:** Nested folder structure support
5. **OAuth Integration:** Google sign-in support
6. **Storage Quotas:** User-specific storage limits
7. **Background Processing:** Asynchronous AI analysis
8. **Real-time Updates:** Live upload progress and AI status
9. **Secure Storage:** Cloudflare R2 with presigned URLs
10. **Responsive UI:** Modern design with TailwindCSS

## Data Flow Diagrams

### File Upload Sequence

```
1. User selects file → Client computes hash
2. Client → Server: Check hash existence
3. Server → Client: Hash check result
4. If new: Client → Server: Initiate upload
5. Server creates session → Returns metadata
6. Client requests presigned URLs
7. Server → R2: Generate URLs
8. Client uploads chunks to R2
9. Client → Server: Complete upload
10. Server verifies → Saves metadata → Queues AI job
11. AI processes file → Updates metadata
```

### Authentication Flow

```
Traditional Auth:
1. User → Client: Credentials
2. Client → Server: Login request
3. Server validates → Generates JWT
4. Server → Client: Tokens
5. Client stores tokens → Redirects

OAuth Flow:
1. User → Google: Authorization request
2. Google → User: Authorization code
3. Client → Server: Code exchange
4. Server → Google: Token exchange
5. Server → Google: User info request
6. Server creates/finds user → Generates JWT
7. Server → Client: Tokens via redirect
```

This documentation reflects the complete NovaDrive application architecture and flow as implemented in the codebase.
