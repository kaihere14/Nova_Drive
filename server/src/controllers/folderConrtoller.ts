import Folder from "../models/folderModel.js";
import { Request, Response } from "express";
import fileModel from "../models/fileSchema.model.js";

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
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};  

