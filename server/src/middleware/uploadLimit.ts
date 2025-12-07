import { connection } from "../utils/bullmqJobs.js";
import { Request, Response, NextFunction } from "express";

const checkLimit = async (req: Request, res: Response, next: NextFunction) => {
    const DAILY_LIMIT = 250 * 1024 * 1024;
    const {fileSize} = req.body; // 250 MB in bytes
    const userId = (req as any).userId;
    try {
        if(!userId || !fileSize){
              return res.status(400).json({ message: "Invalid upload data" });
        }
        const redisKey = `user:${userId}:dailyUpload`;
        const uploadedSize = await connection.get(redisKey);
        
        if (!uploadedSize) {
            await connection.set(redisKey, 0, "EX", 24 * 60 * 60); // Set expiry to 24 hours
        }
      // Set expiry to 24 hours if key is new
        const totalUploaded = uploadedSize ? parseInt(uploadedSize) + fileSize : fileSize;
        
        if (totalUploaded > DAILY_LIMIT) {
            return res.status(403).json({ message: "Daily upload limit exceeded" });
        }  
        next();
    } catch (error) {
        console.error("Error checking upload limit:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default checkLimit;