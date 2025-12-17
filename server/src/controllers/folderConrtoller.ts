import Folder from "../models/folderModel.js";
import { Request, Response } from "express";
import fileModel from "../models/fileSchema.model.js";
import { logger } from "../index.js";
import { Activity } from "../models/logs.model.js";
import { GoogleGenAI } from "@google/genai";


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
    const activity = new Activity({
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
    if (parentFolderId !== "null") {
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
    const activity = new Activity({
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
    const activity = new Activity({
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

interface SuggestionRequest {
  name: string;
  type: "folder";
}

export const suggestedFolderNames = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body as SuggestionRequest;
    if(!name || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const genai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY_4!,
    });
    const existingFoldersName = await Folder.find({ ownerId: (req as any).userId }).select("name -_id");
    const existingNamesList = existingFoldersName.map(folder => folder.name).join(", ");
   
    const prompt = `Analyze the uploaded file and existing folders to determine the best storage location.

FILE DETAILS:
- Name: ${name}
- Type: ${type}

EXISTING FOLDERS:
${existingNamesList}

TASK:
1. Check if any existing folder is suitable for this file type
2. If a suitable folder exists, return ONLY that folder name
3. If no suitable folder exists, suggest exactly 3 new folder names

RESPONSE FORMAT (JSON only, no explanation):
{
  "suggestedFolders": ["folder1", "folder2", "folder3"]
}

RULES:
- If an existing folder matches, return it as the only item in the array
- If no match, suggest exactly 3 new folder names
- Consider file type, name context, and semantic similarity
- Folder names should be clear, professional, and descriptive
- Return ONLY valid JSON, no markdown, no extra text
- You must return ONLY valid JSON.
- Do not include markdown, backticks, or explanations.
- The response must be directly parsable using JSON.parse()`;


const response = await genai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
});
console.log("Suggested folder names raw response:", response);

    const folderNames = response.text as string | undefined;
    console.log("Suggested folder names response:", folderNames);
    try {
      // Try to extract a JSON object from the response even if it's wrapped in
      // markdown or code fences (e.g., ```json { ... } ```).
      let jsonToParse = folderNames || "";

      // Extract first {...} block if present
      const jsonMatch = jsonToParse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonToParse = jsonMatch[0];
      } else {
        // Fallback: remove common code fence markers and trim
        jsonToParse = jsonToParse.replace(/```\w*\n?/g, "").replace(/```/g, "").trim();
      }

      const parsed = JSON.parse(jsonToParse);
      return res.status(200).json({ suggestedFolders: parsed.suggestedFolders || [] });
    } catch (parseError: any) {
      logger.error("suggested_folder_parse_failed", {
        userId: (req as any).userId,
        name,
        type,
        error: parseError.message,
        stack: parseError.stack,
        rawResponse: folderNames,
      });
      return res.status(200).json({ suggestedFolders: [] });
    }
  } catch (error : any) {
    res.status(500).json({ message: "Server error 2", error });
  }
};


export const findFolderByNameOrCreate = async (req: Request, res: Response) => {
  try {
    const { folderName } = req.body;
    const userId = (req as any).userId;
    if (!folderName) {
      return res.status(400).json({ message: "Missing folderName" });
    }
    let folder = await Folder.findOne({ name: folderName, ownerId: userId });
    if (!folder) {
      folder = new Folder({ name: folderName, ownerId: userId });
      await folder.save();
    }
    res.status(200).json({ folderId: folder._id });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error });
  }
};