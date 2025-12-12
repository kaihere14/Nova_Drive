import express, { Request, Response } from "express";
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

const app = express();
app.use(statusMonitor());
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    "https://www.novadrive.space",
    "https://novadrive.space",
    "http://localhost:5173",
    "https://nova-drive-one.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api/chunks", chunkRoutes);
app.use("/api/user", userRouted);
app.use("/api/files", fileRoue);
app.use("/api/otp", otpRoute);
app.use("/api/folders", folderRoute);
app.use("/api/auth/google", oAuthRoute);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running!" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });
