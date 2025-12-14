import Folder from "../models/folderModel.js";
import { Request, Response } from "express";
import fileModel from "../models/fileSchema.model.js";
import { logger } from "../index.js";
import { Activity } from "../models/logs.model.js";

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { userId, folderName, parentFolderId } = req.body;    
    if (!userId || !folderName) {
        return res.status(400).json({ message: "Missing required fields" })
    };
    const newFolder = new Folder({
      name: folderName,
      ownerId: userId,
      parentFolderId: parentFolderId !== "null" ? parentFolderId : null,
    });
    await newFolder.save();
    res.status(201).json(newFolder);
    const activity = new  Activity({
      userId: userId,
      fileId: newFolder._id,
      fileName: folderName,
      action: "folder_created",
    });
    await activity.save();
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  try {
    const { userId, parentFolderId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "Missing required fields" })
    };
    const query: any = { ownerId: userId };
    if ( parentFolderId !== "null") {
      query.parentFolderId = parentFolderId;
    } else {
      query.parentFolderId = null;
    }
    
    const folders = await Folder.find(query).sort({ createdAt: -1 });
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;
        const filesInFolder = await fileModel.find({ location: folderId });
        
        if (filesInFolder.length > 0) {
            return res.status(400).json({ message: "Folder is not empty" });
        }
        const subFolders = await Folder.find({ parentFolderId: folderId });
        if (subFolders.length > 0) {
            return res.status(400).json({ message: "Folder contains subfolders" });
        }
        const deletedFolder = await Folder.findByIdAndDelete(folderId);
        if (!deletedFolder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        res.status(200).json({ message: "Folder deleted successfully" });
        const activity = new  Activity({
            userId: deletedFolder.ownerId,
            fileId: deletedFolder._id,
            fileName: deletedFolder.name,
            action: "folder_deleted"
        });
        await activity.save();
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};  


export const renameFolder = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;
        const { newName } = req.body;
        const folder = await Folder.findById(folderId);
        const oldName = folder?.name;
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        folder.name = newName;
        await folder.save();
        res.status(200).json({ message: "Folder renamed successfully", folder });
        const activity = new  Activity({
            userId: folder.ownerId,
            fileId: folder._id,
            fileName: oldName,
            newFileName: newName,
            action: "folder_renamed"
        });
        await activity.save();
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const fetchAllFolders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        logger.info("fetch_all_folders", { userId });
        const folders = await Folder.find({ ownerId: userId }).sort({ createdAt: -1 }).select("_id name");
        res.status(200).json({ folders });
    } catch (error: any) {
        logger.error("fetch_folders_failed", {
            userId: (req as any).userId,
            error: error.message,
            stack: error.stack,
        });
        res.status(500).json({ message: "Server error", error });
    }
};