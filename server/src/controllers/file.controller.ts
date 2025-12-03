import FileModel from "../models/fileSchema.model.js";
import { Request, Response } from "express";

export const listFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    console.log("Listing files for userId:", userId);
    const files = await FileModel.find({ owner: userId }).sort({ createdAt: -1 });
    console.log("Files found:", files.length);
    res.status(200).json({ files });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ message: "Server error" });
  }
};