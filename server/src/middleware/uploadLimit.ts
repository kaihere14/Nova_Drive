import { connection } from "../utils/bullmqJobs.js";
import { Request, Response, NextFunction } from "express";
import { logger } from "../index.js";

const checkLimit = async (req: Request, res: Response, next: NextFunction) => {
  const DAILY_LIMIT = 250 * 1024 * 1024;
  const { fileSize } = req.body; // 250 MB in bytes
  const userId = (req as any).userId;
  try {
    if (!userId || !fileSize) {
      return res.status(400).json({ message: "Invalid upload data" });
    }
    const redisKey = `user:${userId}:dailyUpload`;
    const uploadedSize = await connection.get(redisKey);

    let totalUploaded: number;

    if (!uploadedSize) {
      // First upload of the day
      totalUploaded = fileSize;
      await connection.set(redisKey, fileSize.toString(), "EX", 24 * 60 * 60);
    } else {
      // Update existing counter
      totalUploaded = parseInt(uploadedSize) + fileSize;
      // Update with new value and reset expiry
      await connection.set(
        redisKey,
        totalUploaded.toString(),
        "EX",
        24 * 60 * 60
      );
    }

    if (totalUploaded > DAILY_LIMIT) {
      return res.status(403).json({
        message: "Daily upload limit exceeded",
        limit: DAILY_LIMIT,
        used: parseInt(uploadedSize || "0"),
        attempted: fileSize,
      });
    }
    next();
  } catch (error) {
    logger.error("Error checking upload limit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default checkLimit;
