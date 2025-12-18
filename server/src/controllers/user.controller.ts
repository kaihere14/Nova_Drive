import { tryCatch } from "bullmq";
import { User } from "../models/user.model.js";
import { IUser } from "../models/user.model.js";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import Folder from "../models/folderModel.js";
import FileModel from "../models/fileSchema.model.js";
import { logger } from "../index.js";

const JWT_SECRET = process.env.JWT_SECRET as Secret;

export const generateToken = (
  userId: string
): { refreshToken: string; accessToken: string } => {
  try {
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
    return { refreshToken, accessToken };
  } catch (error: any) {
    logger.error("token_generation_failed", {
      userId,
      error: error.message,
      stack: error.stack,
    });
    return { refreshToken: "", accessToken: "" };
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser && existingUser.authProvider === "google") {
      return res.status(409).json({
        message:
          "Email already registered via Google OAuth. Please login using Google.",
      });
    }
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const newUser: IUser = new User({ username, email, password });
    await newUser.save();
    const { accessToken, refreshToken } = generateToken(newUser._id.toString());
    res.status(201).json({
      message: "User created successfully",
      newUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.authProvider === "google") {
      return res
        .status(401)
        .json({ message: "Please login using Google OAuth" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const { accessToken, refreshToken } = generateToken(user._id.toString());
    res
      .status(200)
      .json({ message: "Login successful", user, accessToken, refreshToken });
  } catch (error: any) {
    logger.error("user_login_failed", {
      email: req.body.email,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error logging in", error });
  }
};
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

export const refreshAccessToken = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Missing refresh token" });
    }

    interface RefreshTokenPayload {
      userId: string;
      iat?: number;
      exp?: number;
    }

    jwt.verify(
      refreshToken,
      JWT_SECRET,
      (err: Error | null, decoded?: unknown) => {
        if (err) {
          logger.error("refresh_token_verification_failed", {
            error: err.message,
            stack: err.stack,
          });
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        try {
          const userId = (decoded as RefreshTokenPayload).userId;
          const { accessToken, refreshToken: newRefreshToken } =
            generateToken(userId);
          return res
            .status(200)
            .json({ accessToken, refreshToken: newRefreshToken });
        } catch (error: any) {
          logger.error("new_token_generation_failed", {
            error: error.message,
            stack: error.stack,
          });
          return res
            .status(500)
            .json({ message: "Error generating new tokens", error });
        }
      }
    );
  } catch (error: any) {
    logger.error("refresh_token_unhandled_error", {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json({ message: "Error refreshing access token", error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < new Date())) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const { oldPassword, newPassword } = req.body;
  const userId = (req as any).userId;
  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error changing password", error });
  }
};

export const allFoldersAndFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const foldersCount = await Folder.countDocuments({ ownerId: userId });
    const filesCount = await FileModel.countDocuments({ owner: userId });
    const all_files = await FileModel.find({ owner: userId });
    const totalStorageUsed = all_files.reduce((accumulator, file) => {
      return accumulator + (file.size || 0);
    }, 0);
    const totalFavoriteFiles = all_files.filter(
      (file) => file.favourite
    ).length;

    res.status(200).json({
      totalFolders: foldersCount,
      totalFiles: filesCount,
      totalStorageUsed: totalStorageUsed,
      totalFavoriteFiles: totalFavoriteFiles,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const changeName = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const { newName } = req.body;
  const userId = (req as any).userId;
  try {
    if (!newName) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const existingUser = await User.findOne({ username: newName });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    user.username = newName;
    await user.save();
    return res.status(200).json({ message: "Name changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error changing name", error });
  }
};

import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const changeAvatar = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      // If user not found, delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all existing avatars for this user in the `nova/avatars` folder (if any)
    try {
      const prefix = `nova/avatars/${user._id}_`;
      const list = await cloudinary.api.resources({
        type: "upload",
        prefix,
        max_results: 500,
      });
      if (list.resources && list.resources.length > 0) {
        for (const r of list.resources) {
          try {
            await cloudinary.uploader.destroy(r.public_id);
          } catch (err) {
            console.warn(
              "Failed to delete old avatar resource:",
              r.public_id,
              err
            );
          }
        }
      }
    } catch (err) {
      // ignore listing errors - proceed with upload
      console.warn("Error listing old avatar resources:", err);
    }

    // Upload new avatar with a public_id that includes the user id so we can later find/delete it
    const publicIdForUpload = `nova/avatars/${user._id}_${Date.now()}`;
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: publicIdForUpload,
      resource_type: "image",
    });

    // Delete temp file
    fs.unlinkSync(req.file.path);

    // Save new avatar URL
    user.avatar = result.secure_url;
    await user.save();

    // Return updated user info (without password)
    const updatedUser = await User.findById(userId).select("-password");

    return res
      .status(200)
      .json({ message: "Avatar changed successfully", user: updatedUser });
  } catch (error) {
    // If error, try to delete temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error changing avatar:", error);
    return res.status(500).json({ message: "Error changing avatar", error });
  }
};
