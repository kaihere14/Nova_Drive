# file:client

## 1. File Selection & Preparation

- User selects a file in the React UI (`App.jsx`).
- The client reads file metadata (name, size, type).
- The file is split into chunks (default: 5MB each).
- The total number of chunks is calculated:
  ```js
  totalChunks = Math.ceil(file.size / chunkSize);
  ```
- The client prepares a form object with all upload session info.

## 2. Initiate Upload Session

- Client sends a POST request to `/api/chunks/upload-initiate` with JSON body:
  ```json
  {
    "userId": "...",
    "fileName": "...",
    "fileSize": 123456,
    "contentType": "application/pdf",
    "totalChunks": 10,
    "chunkSize": 5242880
  }
  ```
- Server responds with:
  - `uploadSessionId`
  - `tempStorageKey`
  - `finalStorageKey`

## 3. Chunk Upload Loop

**Dynamic Parallel Pool (4 concurrent uploads):**

- The client creates a flat array of chunk indices (0 to totalChunks-1).
- Uses a dynamic pool to keep up to 4 chunk uploads in flight at all times:
  1. As soon as one upload finishes, the next chunk starts immediately.
  2. Each chunk is uploaded as a `multipart/form-data` POST to `/api/chunks/upload-chunk`:
  - `chunk`: The chunk file/blob
  - `sessionId`: The session ID from initiation
  - `index`: The chunk index (0-based)
  3. Progress is updated in the UI as each chunk completes.
  4. When all chunks are uploaded, the client calls `/api/chunks/upload-complete`.

## 4. Complete Upload

- After all chunks are uploaded, client sends a POST request to `/api/chunks/upload-complete` with JSON body:
  ```json
  {
    "sessionId": "..."
  }
  ```
- Server merges chunks and finalizes the upload.

## 5. (Optional) UI Feedback

- Progress and errors are logged in the browser console and/or shown in the UI.

---

# file:server

## 1. Express Server Setup

- Uses Express, CORS, dotenv, and connects to MongoDB.
- Main entry: `src/index.ts`
- Routes defined in `src/routes/chunks.routes.ts`:
  - `/upload-initiate` (POST)
  - `/upload-chunk` (POST, with multer for file upload)
  - `/upload-complete` (POST)

## 2. Upload Session Initiation (`uploadInitiate`)

- Validates request body for all required fields.
- Creates a temp directory for chunk storage.
- Creates a new `UploadSession` document in MongoDB (see `chunk.model.ts`).
- Responds with session details.

## 3. Chunk Upload (`uploadChunk`)

- Uses multer to handle `multipart/form-data` and store chunk in memory.
- Validates session and chunk index.
- Checks if chunk already uploaded.
- Saves chunk to disk in the session's temp directory.
- Marks chunk as received in the session's `receivedChunks` map.
- Responds with success or error.

## 4. Complete Upload (`completeUpload`)

- Validates that all chunks are present by checking `receivedChunks` for all indices from 0 to totalChunks-1.
- If any chunk is missing, responds with error and missing indices.
- If all chunks are present:
  - Merges all chunk files in order into the final file.
  - Cleans up the temp directory.
  - Updates session status to `completed`.
  - Responds with success and final file path.

## 5. Data Model (`chunk.model.ts`)

- `UploadSession` schema includes:
  - `userId`, `fileName`, `fileSize`, `contentType`, `totalChunks`, `chunkSize`
  - `receivedChunks`: Map of chunk indices to boolean (received or not)
  - `tempStorageKey`, `finalStorageKey`, `status`, `expiresAt`, timestamps

## 6. Error Handling

- All endpoints validate input and handle errors gracefully.
- Duplicate or out-of-range chunk uploads are rejected.
- If not all chunks are uploaded, server will not merge.

---

# Example End-to-End Flow

1. User selects a file in the client UI.
2. Client splits file into N chunks and initiates upload session.
3. Server creates session and returns session ID.
4. Client uploads each chunk (with session ID and index) one by one.
5. Server saves each chunk and marks it as received.
6. After last chunk, client calls complete endpoint.
7. Server merges chunks, cleans up, and marks upload as complete.
8. Client receives confirmation and can display/upload result.

---

# Notes

- Chunk index is 0-based throughout the codebase (client and server).
- All chunk uploads and session management are atomic and robust to retries.
- The system is designed for large file uploads and can be extended for resumable uploads, progress tracking, etc.
