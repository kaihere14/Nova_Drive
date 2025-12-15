import Activity from "../models/logs.model";
import { Request, Response } from "express";
import { logger } from "../index.js";

export const getUserActivities = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ activities });
  } catch (error: any) {
    logger.error("fetch_user_activities_failed", {
      userId: (req as any).userId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Server error" });
}
};