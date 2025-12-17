import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import connectDB from "./config/db.config.js";
import chunkRoutes from "./routes/chunks.routes.js";
import userRouted from "./routes/user.routes.js";
import fileRoue from "./routes/file.routes.js";
import otpRoute from "./routes/otpRoutes.js";
import folderRoute from "./routes/folder.routes.js";
import oAuthRoute from "./routes/oAuth.route.js";
import logRoutes from "./routes/logs.routes.js";
import cors from "cors";

import { workers, queues, connection } from "./utils/bullmqJobs.js";
import winston from "winston"

const app = express();
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://www.novadrive.space",
      "https://novadrive.space",
      "http://localhost:5173",
      "https://nova-drive-one.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
//testing commit

app.use("/api/chunks", chunkRoutes);
app.use("/api/user", userRouted);
app.use("/api/files", fileRoue);
app.use("/api/otp", otpRoute);
app.use("/api/folders", folderRoute);
app.use("/api/auth/google", oAuthRoute);
app.use("/api/logs",logRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running!" });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Global error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("express_error", {
    error: err.message,
    stack: err.stack,
    status: err.status || 500,
    path: req.path,
    method: req.method,
  });
  res.status(err.status || 500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  logger.info("shutdown_initiated", { signal });

  try {
    // Close all workers
    for (const worker of workers) {
      logger.info("worker_closing", { workerName: worker.name });
      await worker.close();
    }

    // Close all queues
    for (const queue of queues) {
      logger.info("queue_closing", { queueName: queue.name });
      await queue.close();
    }

    // Close Redis connection
    logger.info("redis_disconnecting");
    await connection.quit();

    logger.info("shutdown_completed", { signal });
    process.exit(0);
  } catch (error: any) {
    logger.error("shutdown_failed", {
      signal,
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", {
    error: error.message,
    stack: error.stack,
    name: error.name,
  });
  gracefulShutdown("uncaughtException");
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason: any, promise) => {
  logger.error("unhandled_rejection", {
    reason: reason?.message || String(reason),
    stack: reason?.stack,
    promise: String(promise),
  });
  gracefulShutdown("unhandledRejection");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info("server_started", {
        port: PORT,
        nodeEnv: process.env.NODE_ENV || "development",
      });
    });
  })
  .catch((error: any) => {
    logger.error("server_startup_failed", {
      error: error.message,
      stack: error.stack,
      port: PORT,
    });
    process.exit(1);
  });
