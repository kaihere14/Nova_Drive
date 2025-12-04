import express, { Request, Response } from "express";
import "dotenv/config";
import connectDB from "./config/db.config.js";
import chunkRoutes from "./routes/chunks.routes.js";
import userRouted from "./routes/user.routes.js";
import fileRoue from "./routes/file.routes.js";
import cors from "cors";
import statusMonitor from "express-status-monitor";

// Load environment variable

const app = express();
app.use(statusMonitor());
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*", // Allow all origins for simplicity; adjust as needed for security
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/chunks", chunkRoutes);
app.use("/api/user", userRouted);
app.use("/api/files", fileRoue);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running!" });
});

// Start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });
