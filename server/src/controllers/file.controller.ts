import { Schema } from "inspector/promises";
import FileModel from "../models/fileSchema.model.js";
import { Request, Response } from "express";

export const listFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { directory } = req.query as { directory?: string };
    
    const query: any = { owner: userId };
    
    // Only add location filter if directory is provided and not "null" string
    if (directory && directory !== "null") {
      query.location = directory;
    } else {
      query.location = null;
    }
    
    const files = await FileModel.find(query).sort({ createdAt: -1 });
    res.status(200).json({ files });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ message: "Server error" });
  }
};