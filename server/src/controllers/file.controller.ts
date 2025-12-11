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

export const totalFilesOfUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const fileCount = await FileModel.countDocuments({ owner: userId });
    res.status(200).json({ totalFiles: fileCount });
  } catch (error) {
    console.error("Error counting files:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const setFavourite = async (req: Request, res: Response) => {
    try {
        const { fileId } = req.params;
        const file = await FileModel.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        file.favourite = !file.favourite;
        await file.save();
        res.status(200).json({ message: "File favourite status updated", favourite: file.favourite });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const listFavouriteFiles = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const favouriteFiles = await FileModel.find({ owner: userId, favourite: true }).sort({ createdAt: -1 });
        res.status(200).json({ files: favouriteFiles });
    } catch (error) {
        console.error("Error listing favourite files:", error);
        res.status(500).json({ message: "Server error" });
    }
}