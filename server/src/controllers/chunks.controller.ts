import { Request, Response } from "express";
import chunkModel from "../models/chunk.model.js";
import Hash from "../models/hashModel.js";
import {
  r2CreateMultipart,
  r2GetPresignedUrl,
  r2CompleteMultipart,
} from "./cloudflare.controller.js";
import FileModel from "../models/fileSchema.model.js";
import { connection, extractData } from "../utils/bullmqJobs.js";
import { User } from "../models/user.model.js";

interface UploadInitiateBody {
  userId: string;
  fileHash?: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  totalChunks: number;
  chunkSize: number;
}

export const loggingHash = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fileHash, sessionId } = req.body;

    if (!fileHash || !sessionId) {
      res.status(400).json({ message: "Missing fileHash or sessionId field" });
      return;
    }

    const newHash = new Hash({ fileHash, sessionId });
    await newHash.save();

    res.status(201).json({ message: "File hash logged successfully" });
  } catch (error) {
    console.error("Error logging file hash:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const computeHashCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fileHash,userId } = req.body;

    if (!fileHash) {
      res.status(400).json({ message: "Missing fileHash field" });
      return;
    }
    const user = await User.findById(userId);
    
    if(!user) {
      res.status(404).json({message: "User not found"});
      return;
    }
    if(user){
      if(user.storageUsed && user.storageQuota) {
        if(user.storageUsed >= user.storageQuota) {
          res.status(403).json({message: "Storage quota exceeded"});
          return;
        }
      }
    }
    

    const existingHash = await Hash.findOne({ fileHash });
    if (existingHash) {
      // Check if hash is still valid (within 5 minutes)
      const now = new Date();
      const createdAt = new Date(existingHash.createdAt);
      const fiveMinutesInMs = 5 * 60 * 1000;

      if (now.getTime() - createdAt.getTime() > fiveMinutesInMs) {
        // Hash expired, delete it and allow re-upload
        await Hash.findOneAndDelete({ fileHash });
        res.status(200).json({ exists: false, expired: true });
      } else {
        res
          .status(200)
          .json({ exists: true, sessionId: existingHash.sessionId });
      }
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking file hash:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadInitiate = async (
  req: Request<{}, {}, UploadInitiateBody>,
  res: Response
): Promise<void> => {
  try {
    const {
      userId,
      fileName,
      fileSize,
      contentType,
      totalChunks,
      chunkSize,
      fileHash,
    } = req.body;

    if (
      !userId ||
      !fileName ||
      !fileSize ||
      !contentType ||
      !totalChunks ||
      !chunkSize ||
      !fileHash
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Create key with userId path structure
    const key = `uploads/${userId}/${fileHash}+${new Date().getSeconds()}`;
    const uploadId = await r2CreateMultipart(key, fileName, contentType);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

    const newUploadSession = new chunkModel({
      userId,
      uploadId,
      fileName,
      fileSize,
      contentType,
      totalChunks,
      chunkSize,
      expiresAt,
    });

    const savedSession = await newUploadSession.save();

    res.status(201).json({
      message: "Upload session initiated",
      uploadSessionId: savedSession._id,
      uploadId: uploadId,
      key: key,
    });
  } catch (error) {
    console.error("Error initiating upload session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const preAssignUrls = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { key, uploadId, PartNumber } = req.body;
  try {
    const url = await r2GetPresignedUrl(key, uploadId, PartNumber);
    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const completeUpload = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  try {
    const { sessionId, uploadId, key, parts,fileName,mimeType, size ,location } = req.body;
    

    const session = await chunkModel.findById(sessionId);
    const user  = await User.findById(session?.userId);
    if(user) {
      user.storageUsed = (user.storageUsed || 0) + size;
      await user.save();
    }
    if (!session) return res.status(404).json({ error: "Invalid session" });

    // Validate required parameters for multipart completion
    if (!uploadId || !key || !Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({
        error: "Missing required fields: uploadId, key, and parts are required",
      });
    }

    // Validate that all parts are present
    if (parts.length !== session.totalChunks) {
      return res.status(400).json({
        error: "Parts count mismatch",
        expected: session.totalChunks,
        received: parts.length,
      });
    }

    // Complete the multipart upload on R2
    const result = await r2CompleteMultipart(uploadId, key, parts);

    // Update session status

    session.status = "completed";
    await session.save();
    const file = await FileModel.create({
      owner: session.userId,              

      originalFileName: fileName,         
      mimeType: mimeType,                 
      size: size,                         

      bucket: result.Bucket,             
      r2Key: key,          
      location: location || null,             

      etag: result.ETag,                
      versionId: result.VersionId,        

      aiStatus: "pending",                
      tags: [],
      summary: "",

      createdAt: new Date(),
    });
    await file.save(); 
    
    // Queue AI processing job
    await extractData(file._id.toString(), fileName, mimeType, key, file.owner.toString());
    connection.incrby(`user:${session.userId}:dailyUpload`, size);

    res.json({
      success: true,
      result,
      location: result.Location,
      key: result.Key,
    });
  } catch (err) {
    console.error("Error completing upload:", err);
    res.status(500).json({
      error: "Server error",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const deleteHashSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;
  try {
    await Hash.findOneAndDelete({ sessionId: sessionId });
    res.status(200).json({ message: "Hash session deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUploadStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;
  try {
    const session = await chunkModel.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Invalid session" });
      return;
    }

    if (session.status === "completed") {
      Hash.findOneAndDelete({ sessionId: sessionId }).catch((err) => {
        console.error("Error deleting hash after completion:", err);
      });
    }

    res.json({
      status: session.status,
      totalChunks: session.totalChunks,
      uploadId: session.uploadId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
