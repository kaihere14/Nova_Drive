# Server Crash Analysis Report

## Critical Issues Found

### 🔴 **CRITICAL - 1: Redis Connection Not Properly Managed**

**Location:** `src/utils/bullmqJobs.ts` (Lines 19-27)

```typescript
export const connection = new IORedis({
  host: "redis-15783.crce179.ap-south-1-1.ec2.cloud.redislabs.com",
  port: 15783,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
```

**Problems:**

- Connection is created once and never closed
- No error handlers on the Redis connection
- No reconnection logic
- Memory leak: Workers never disconnect from Redis
- If Redis connection drops, server will hang indefinitely

**Impact:** Server hangs/crashes after Redis connection timeout

---

### 🔴 **CRITICAL - 2: Workers Never Gracefully Shutdown**

**Location:** `src/utils/bullmqJobs.ts` (Lines 52-300+)

Four workers are created (`workerExtraction`, `worker`, `imageWorker`, `otherWorker`) but:

- Never stored in variables for cleanup
- No error handlers on workers
- No graceful shutdown on process exit
- Memory accumulates as jobs queue up
- Dead workers keep Redis connections alive

**Impact:** Memory leak that crashes server after hours

---

### 🔴 **CRITICAL - 3: Unhandled Promise Rejection in Worker**

**Location:** `src/utils/bullmqJobs.ts` (Line 110+)

```typescript
await FileModel.findByIdAndUpdate(fileId, { aiStatus: "processing" });
```

If this fails, the promise rejection could crash the entire process (depending on Node.js version).

**Impact:** Random server crashes

---

### 🟠 **HIGH - 4: Missing Error Handler on BullMQ Workers**

**Location:** `src/utils/bullmqJobs.ts` (Lines 52-300)

Workers process jobs but have no error event handlers:

```typescript
const workerExtraction = new Worker(
  "metadata-extraction-queue",
  async (job) => {
    // No error handler registered
  }
);
```

Without `.on('error', ...)`, any uncaught error in a worker will silently fail or crash.

**Impact:** Silent failures, unpredictable crashes

---

### 🟠 **HIGH - 5: Express Server Has No Global Error Handler**

**Location:** `src/index.ts` (Lines 1-49)

No global error handler middleware:

```typescript
app.use(express.json());
// ... routes
app.listen(PORT, ...)
```

Missing:

- Unhandled rejection listener
- Global error middleware
- Process error handlers

**Impact:** Any unhandled error in async handlers crashes server

---

### 🟠 **HIGH - 6: R2 Client Leaks Connections**

**Location:** `src/controllers/cloudflare.controller.ts` (Lines 15-26)

```typescript
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  // ... no connection pooling, no max connections limit
});
```

S3Client doesn't have connection pooling configured:

- Each request might create a new connection
- Connections not properly closed
- Can exhaust file descriptors

**Impact:** "Too many open connections" crash

---

### 🟡 **MEDIUM - 7: Missing Timeout in Upload Middleware**

**Location:** `src/middleware/uploadLimit.ts` (Lines 5-31)

```typescript
const redisKey = `user:${userId}:dailyUpload`;
const uploadedSize = await connection.get(redisKey);

if (!uploadedSize) {
  await connection.set(redisKey, 0, "EX", 24 * 60 * 60);
}
```

Issue: The `set` call doesn't reset the key, it only sets if missing. If key exists, expiry isn't updated.

**Impact:** Daily limits don't reset properly

---

### 🟡 **MEDIUM - 8: Fetch Requests in Workers Have No Timeouts**

**Location:** `src/utils/bullmqJobs.ts` (Lines 71-75)

```typescript
const response = await fetch(imageUrl);
const imageArrayBuffer = await response.arrayBuffer();
```

Fetch calls have no timeout. If R2 is slow, worker hangs indefinitely.

**Impact:** Workers stuck consuming memory

---

### 🟡 **MEDIUM - 9: Database Connection Not Pooled**

**Location:** `src/config/db.config.ts`

```typescript
await mongoose.connect(mongoURI);
```

No connection pool size configured. Mongoose default is 10 connections, which can be insufficient under load.

**Impact:** Connection pool exhaustion under high concurrent requests

---

### 🟡 **MEDIUM - 10: No Health Check Endpoint**

**Location:** `src/index.ts`

Only basic "/" endpoint exists. No `/health` endpoint for:

- Liveness checks
- Readiness checks
- Load balancer health

**Impact:** Load balancer doesn't know server is down until timeout

---

## Recommended Fixes (Priority Order)

### Fix 1: Add Redis Connection Error Handlers (IMMEDIATE)

```typescript
connection.on("error", (err) => {
  console.error("Redis connection error:", err);
  process.exit(1);
});

connection.on("connect", () => {
  console.log("Redis connected");
});

connection.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});
```

### Fix 2: Add Worker Error Handlers (IMMEDIATE)

```typescript
workerExtraction.on("error", (err) => {
  console.error("Worker extraction error:", err);
});

workerExtraction.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

### Fix 3: Graceful Shutdown Handler (IMMEDIATE)

```typescript
const workers = [workerExtraction, worker, imageWorker, otherWorker];

async function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  await Promise.all(workers.map((w) => w.close()));
  await myQueue.close();
  await connection.quit();
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
```

### Fix 4: Add Global Error Handlers

```typescript
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Express Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
);
```

### Fix 5: Add Fetch Timeouts

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

const response = await fetch(imageUrl, { signal: controller.signal });
clearTimeout(timeoutId);
```

### Fix 6: Configure Mongoose Connection Pool

```typescript
await mongoose.connect(mongoURI, {
  maxPoolSize: 20,
  minPoolSize: 5,
  waitQueueTimeoutMS: 10000,
});
```

### Fix 7: Add Health Check Endpoint

```typescript
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});
```

### Fix 8: Configure S3Client Connection Pooling

```typescript
import { HttpHandlerOptions } from "@smithy/types";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { ... },
  // Add HTTP agent configuration
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 30000,
    socketTimeout: 30000,
  }),
});
```

---

## Summary

Your server crashes due to **unmanaged Redis connections and BullMQ workers** that accumulate and eventually exhaust system resources. Combined with **missing error handlers** and **no graceful shutdown**, the server becomes unstable over time.

Implementing the critical fixes above will resolve the crashes.
