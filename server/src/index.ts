import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import connectDB from "./config/db.config.js";
import chunkRoutes from "./routes/chunks.routes.js";
import userRouted from "./routes/user.routes.js";
import fileRoue from "./routes/file.routes.js";
import otpRoute from "./routes/otpRoutes.js";
import folderRoute from "./routes/folder.routes.js";
import oAuthRoute from "./routes/oAuth.route.js";
import cors from "cors";
import statusMonitor from "express-status-monitor";
import { workers, queues, connection } from "./utils/bullmqJobs.js";

const app = express();
app.use(statusMonitor());
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

app.use("/api/chunks", chunkRoutes);
app.use("/api/user", userRouted);
app.use("/api/files", fileRoue);
app.use("/api/otp", otpRoute);
app.use("/api/folders", folderRoute);
app.use("/api/auth/google", oAuthRoute);

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
  console.error("Express Error:", err);
  res.status(err.status || 500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, shutting down gracefully...`);

  try {
    // Close all workers
    for (const worker of workers) {
      console.log("Closing worker...");
      await worker.close();
    }

    // Close all queues
    for (const queue of queues) {
      console.log("Closing queue...");
      await queue.close();
    }

    // Close Redis connection
    console.log("Closing Redis connection...");
    await connection.quit();

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
