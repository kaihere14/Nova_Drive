# NovaDrive Complete Feature & Flow Documentation

## Overview

NovaDrive is a secure cloud storage application with AI-powered file organization, chunked uploads, and intelligent search capabilities. Built with React (frontend) and Node.js/Express (backend), it uses Cloudflare R2 for storage and Gemini AI for file analysis.


---

## 🔐 **AUTHENTICATION FLOWS**

### **Local Registration Flow**

1. **User Input**: Email, username, password
2. **OTP Generation**: Server creates 6-digit OTP, stores in DB with 5min expiry
3. **Email Delivery**: Resend API sends styled HTML email with OTP
4. **OTP Verification**: User enters OTP, server validates and creates account
5. **JWT Tokens**: Returns access (15min) + refresh (7d) tokens
6. **Auto-Login**: User redirected to upload page

### **Local Login Flow**

1. **Credentials Check**: Email/password validation
2. **Password Hashing**: bcrypt comparison with stored hash
3. **Token Generation**: JWT access + refresh tokens
4. **Session Management**: Tokens stored in localStorage

### **Google OAuth Flow**

1. **OAuth Redirect**: User clicks Google login → Google consent screen
2. **Token Exchange**: Server exchanges code for access/ID tokens
3. **Profile Fetch**: Gets user info from Google APIs
4. **User Creation**: Creates OAuth user (no password, googleId stored)
5. **Token Response**: Returns JWT tokens to client

### **Token Refresh Flow**

1. **401 Interception**: Axios interceptor catches expired access tokens
2. **Refresh Attempt**: Uses refresh token to get new access token
3. **Retry Request**: Replays original failed request with new token
4. **Fallback**: If refresh fails, redirects to login

---

## 📁 **FILE MANAGEMENT FLOWS**

### **Chunked Upload Flow**

1. **File Selection**: User selects file in UploadModal
2. **Hash Computation**: Client computes SHA-256 hash of first 4MB
3. **Hash Check**: Server checks if file already exists (prevents duplicates)
4. **Upload Initiation**: Server creates multipart upload in Cloudflare R2
5. **Chunking**: File split into 5MB chunks (configurable)
6. **Parallel Upload**: 4 chunks uploaded simultaneously using presigned URLs
7. **Completion**: Server completes multipart upload, creates File record
8. **AI Processing**: Queues background job for file analysis

### **File Download Flow**

1. **Download Request**: User clicks download button
2. **Presigned URL**: Server generates Cloudflare R2 presigned URL (1hr expiry)
3. **Browser Redirect**: User downloads directly from R2 (no server proxy)

### **File Preview Flow**

1. **Preview Request**: User clicks file or uses AI search result
2. **URL Generation**: Server creates presigned URL for preview
3. **Modal Display**: File displayed in modal (images, PDFs, etc.)
4. **Security**: User ID validation prevents unauthorized access

### **File Organization Flow**

1. **Folder Creation**: User creates folder with name and optional parent
2. **File Movement**: Files can be moved between folders
3. **Hierarchical Structure**: Nested folder support
4. **Empty Check**: Cannot delete folders with files/subfolders

---

## 🤖 **AI-POWERED FEATURES**

### **File Analysis Pipeline**

1. **Upload Trigger**: After successful upload, file queued for AI processing
2. **Content Extraction**:
   - Images: Gemini Vision API analyzes image content
   - PDFs: pdf-parse extracts text content
   - Other files: Filename + MIME type analysis
3. **Tag Generation**: AI generates 3-8 relevant tags per file
4. **Summary Creation**: AI creates 1-2 sentence description
5. **Database Update**: Tags, summary, and status saved to File model

### **AI Search Flow**

1. **Query Input**: User types in search bar with AI mode enabled
2. **Debounced Request**: 1-second delay before API call
3. **File Retrieval**: Server gets all user's files (name, summary, tags, R2 key)
4. **Gemini Processing**: AI analyzes query against file metadata
5. **Results Ranking**: Returns top 3 matches with relevance scores (0-100)
6. **UI Categorization**: Results grouped by match quality (<60%, 60-80%, 80%+)

### **Background Processing**

- **BullMQ Queues**: Separate queues for PDF, image, and other file processing
- **Redis Storage**: Job persistence and status tracking
- **Error Handling**: Failed jobs marked, retries with exponential backoff
- **Rate Limiting**: Gemini API key rotation on 429 errors

---

## 📊 **USER DASHBOARD & NAVIGATION**

### **Main Dashboard (UploadPage)**

1. **Authentication Check**: JWT verification on page load
2. **Stats Loading**: File count, folder count, storage usage, favorites
3. **File Listing**: Paginated file display with sorting
4. **View Modes**: Files, Recent (24h), Favorites, Trash (placeholder)
5. **Tag Filtering**: Filter files by AI-generated tags
6. **Search Integration**: Real-time search with AI toggle

### **Folder Navigation**

1. **Breadcrumb System**: Navigate folder hierarchy
2. **Subfolder Display**: Grid layout for child folders
3. **File Inheritance**: Files inherit parent folder location
4. **Back Navigation**: Return to parent or root directory

### **Sidebar Navigation**

- **View Switching**: Files, Recent, Favorites, Trash
- **Storage Display**: Usage bar with percentage
- **Logout**: Token cleanup and redirect

---

## 🔧 **TECHNICAL INFRASTRUCTURE**

### **Backend Architecture**

- **Express Server**: RESTful API with CORS configuration
- **MongoDB**: User, File, Folder, Chunk, Hash, OTP models
- **JWT Authentication**: Access/refresh token system
- **BullMQ**: Background job processing with Redis
- **Cloudflare R2**: S3-compatible object storage
- **Rate Limiting**: Daily upload limits (250MB) via Redis

### **Frontend Architecture**

- **React Router**: SPA navigation (Home, Login, Upload, Folder, Profile)
- **Context API**: UserContext (auth + stats), FolderContext (navigation)
- **Custom Hooks**: useChunkUpload, useUser, useFolderData
- **Axios Interceptors**: Automatic token refresh on 401
- **Real-time Updates**: Polling for upload status changes

### **Security Features**

- **File Hashing**: SHA-256 prevents duplicate uploads
- **JWT Verification**: All API routes protected
- **Upload Limits**: Daily quota enforcement
- **Path Security**: User ID validation in R2 keys
- **OTP Security**: 5-minute expiry, one-time use

---

## 🎨 **UI/UX FEATURES**

### **Responsive Design**

- **Mobile-First**: Optimized for mobile devices
- **Adaptive Layouts**: Desktop (table), mobile (cards)
- **Touch Interactions**: Swipe gestures, tap-to-preview

### **Visual Feedback**

- **Loading States**: Spinners, skeleton screens, progress bars
- **Status Messages**: Upload progress, AI processing status
- **Error Handling**: User-friendly error messages
- **Success Animations**: Upload completion, form submissions

### **Accessibility**

- **Keyboard Navigation**: Tab navigation, enter to submit
- **Screen Reader**: Semantic HTML, ARIA labels
- **Color Contrast**: High contrast ratios for readability

---

## 📈 **DATA FLOW DIAGRAM**

```
User Action → Client Component → API Call → Server Controller → Database/Model
                                      ↓
Background Jobs → BullMQ Queue → Worker → AI Processing → Database Update
                                      ↓
Real-time Updates → Polling/WebSocket → UI Refresh → User Feedback
```

---

## 🚀 **DEPLOYMENT & SCALING**

### **Production Setup**

- **Frontend**: Vercel deployment with CDN
- **Backend**: Node.js server with PM2 clustering
- **Database**: MongoDB Atlas with connection pooling
- **Cache**: Redis Cloud for job queues and rate limiting
- **Storage**: Cloudflare R2 with global CDN
- **Email**: Resend API for transactional emails

### **Monitoring**

- **Health Checks**: `/health` endpoint for uptime monitoring
- **Error Logging**: Console logging with structured error handling
- **Performance**: Express status monitor middleware
- **Background Jobs**: BullMQ dashboard for queue monitoring

---

## 🔄 **END-TO-END USER JOURNEYS**

### **New User Journey**

1. **Landing Page**: Marketing content, feature overview
2. **Registration**: Email verification with OTP
3. **First Upload**: Drag & drop file, watch chunked upload
4. **AI Processing**: Wait for tags and summary generation
5. **Organization**: Create folders, move files, set favorites
6. **Search**: Use AI search to find files instantly

### **Returning User Journey**

1. **Login**: Email/password or Google OAuth
2. **Dashboard**: View stats, recent files, storage usage
3. **File Management**: Upload, download, organize, delete
4. **Advanced Search**: AI-powered semantic search
5. **Collaboration**: Share links with expiration

---

## 🛠 **DEVELOPMENT WORKFLOW**

### **Local Development**

- **Frontend**: `npm run dev` (Vite dev server)
- **Backend**: `npm run dev` (nodemon with TypeScript)
- **Database**: Local MongoDB or MongoDB Atlas
- **Redis**: Local Redis or Redis Cloud
- **Environment**: `.env` files for API keys and secrets

### **Build Process**

- **Frontend**: Vite build with Tailwind CSS optimization
- **Backend**: TypeScript compilation to JavaScript
- **Assets**: Static files served via CDN
- **Dependencies**: Package management with npm/yarn

---

This comprehensive documentation covers all major flows, features, and technical aspects of NovaDrive from user registration to file management and AI-powered search capabilities. The application demonstrates modern full-stack development practices with robust security, scalability, and user experience considerations.
