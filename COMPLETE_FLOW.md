# NovaDrive - Complete Application Flow Documentation

## Updates Based on Latest Codebase

### Client Updates

1. **Dependencies**:

   - Added `multer` for file handling.
   - Updated React and React-DOM to version 19.2.0.
   - TailwindCSS and Vite dependencies updated to the latest versions.

2. **App Structure**:

   - `App.jsx` defines routes for pages like `UploadPage`, `LoginPage`, `SignupPage`, `ProfilePage`, etc.
   - `UserProvider` wraps the app to manage authentication and user state globally.

3. **Hooks**:

   - `useChunkUpload.js` handles file uploads, including chunking, hashing, and progress tracking.
   - `useUser.js` provides user-related utilities.

4. **Context**:
   - `UserContext.jsx` manages authentication, token refresh, and user session state.
   - Axios interceptors handle 401 errors and auto-refresh tokens.

### Server Updates

1. **Dependencies**:

   - Added `@aws-sdk` for S3 operations.
   - Added `bullmq` for job queue management.
   - Updated `mongoose` to version 8.20.0.

2. **Routes**:

   - `chunks.routes.ts` handles multipart uploads, hash logging, and file management.
   - `user.routes.ts` manages user authentication and profile operations.

3. **Controllers**:

   - `chunks.controller.ts` handles file uploads, including deduplication and multipart uploads.
   - `user.controller.ts` manages user registration, login, and token refresh.

4. **Database Models**:

   - `chunk.model.ts` tracks upload sessions.
   - `hashModel.ts` manages file hash deduplication.
   - `fileSchema.model.ts` stores file metadata.

5. **Environment Variables**:
   - `.env` includes keys for MongoDB, JWT, Cloudflare, and Redis.

## Detailed Application Flow

### Client-Side Flow

#### 1. **Application Initialization**

- **Entry Point**: `main.jsx`
  - Renders the `App` component inside the `#root` element.
  - Wraps the application with `UserProvider` to manage global user state.

#### 2. **Routing**

- **File**: `App.jsx`
  - Uses `react-router-dom` to define routes for the following pages:
    - `/`: `HomePage`
    - `/login`: `LoginPage`
    - `/signup`: `SignupPage`
    - `/upload`: `UploadPage`
    - `/profile`: `ProfilePage`
  - Each route is associated with a specific page component.

#### 3. **Authentication Management**

- **File**: `UserContext.jsx`
  - Manages user authentication state and tokens.
  - Implements the following key functions:
    - `login`: Authenticates the user and stores tokens in `localStorage`.
    - `logout`: Clears user data and tokens.
    - `refreshToken`: Automatically refreshes the access token when expired.
  - Axios interceptors are configured to:
    - Attach the access token to outgoing requests.
    - Handle 401 errors by attempting token refresh.

#### 4. **File Upload Process**

- **File**: `useChunkUpload.js`
  - Handles large file uploads by splitting files into chunks.
  - Key steps:
    1. Compute the file hash to check for duplicates.
    2. Request presigned URLs for each chunk from the server.
    3. Upload chunks to Cloudflare R2 using the presigned URLs.
    4. Notify the server to finalize the upload.
  - Tracks upload progress and handles retries for failed chunks.

#### 5. **UI Components**

- **Folder**: `src/components`
  - `Navbar.jsx`: Displays navigation links based on authentication state.
  - `UploadButton.jsx`: Triggers the file upload process.
  - `ProgressBar.jsx`: Visualizes upload progress.
  - `StatusMessage.jsx`: Displays success or error messages.

### Server-Side Flow

#### 1. **Server Initialization**

- **File**: `index.ts`
  - Sets up the Express server.
  - Configures middleware for CORS, JSON parsing, and logging.
  - Connects to MongoDB using `mongoose`.
  - Registers routes for user, file, and chunk operations.

#### 2. **Authentication**

- **File**: `user.controller.ts`
  - Handles user-related operations:
    - `register`: Creates a new user in the database.
    - `login`: Verifies credentials and generates JWT tokens.
    - `refreshToken`: Issues a new access token using the refresh token.
  - Uses `bcrypt` for password hashing and `jsonwebtoken` for token generation.

#### 3. **File Upload Process**

- **Files**: `chunks.controller.ts`, `chunks.routes.ts`
  - **Step 1**: Compute File Hash
    - Endpoint: `/api/chunks/compute-hash-check`
    - Checks if the file already exists in the database using its hash.
  - **Step 2**: Initiate Upload
    - Endpoint: `/api/chunks/upload-initiate`
    - Creates an upload session and returns metadata.
  - **Step 3**: Generate Presigned URLs
    - Endpoint: `/api/chunks/get-presigned-url`
    - Generates presigned URLs for uploading chunks to Cloudflare R2.
  - **Step 4**: Finalize Upload
    - Endpoint: `/api/chunks/upload-complete`
    - Verifies all chunks are uploaded and merges them into a complete file.

#### 4. **Job Queue Management**

- **File**: `bullmqJobs.ts`
  - Uses `BullMQ` to manage background jobs for:
    - File processing.
    - Cleanup of incomplete uploads.
  - Jobs are processed asynchronously to improve performance.

#### 5. **Database Models**

- **Files**: `chunk.model.ts`, `fileSchema.model.ts`, `user.model.ts`
  - `chunk.model.ts`: Tracks the status of uploaded chunks.
  - `fileSchema.model.ts`: Stores metadata for uploaded files.
  - `user.model.ts`: Manages user data, including hashed passwords.

#### 6. **Environment Configuration**

- **File**: `.env`
  - Stores sensitive keys and configuration values:
    - MongoDB connection string.
    - JWT secret keys.
    - Cloudflare R2 credentials.
    - Redis connection details.

### API Endpoints

#### Authentication

- **POST** `/api/user/register`: Register a new user.
- **POST** `/api/user/login`: Authenticate and return tokens.
- **POST** `/api/user/refresh-token`: Refresh access tokens.
- **GET** `/api/user/verify-auth`: Verify user session.

#### File Upload

- **POST** `/api/chunks/compute-hash-check`: Check for duplicate files.
- **POST** `/api/chunks/upload-initiate`: Start a multipart upload.
- **POST** `/api/chunks/get-presigned-url`: Get presigned URLs for chunk uploads.
- **POST** `/api/chunks/upload-complete`: Complete the upload process.

#### File Management

- **GET** `/api/files/list-files`: List all user files.
- **POST** `/api/chunks/get-download-url`: Generate a download URL.
- **DELETE** `/api/chunks/delete-file`: Delete a file.

---

This document has been updated to provide a detailed explanation of the NovaDrive application flow as of December 8, 2025.
