import { tryCatch } from "bullmq";
import { User } from "../models/user.model.js";
import { IUser } from "../models/user.model.js";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import Folder from "../models/folderModel.js";
import FileModel from "../models/fileSchema.model.js";

const JWT_SECRET = process.env.JWT_SECRET as Secret;

export const generateToken = (
  userId: string
): { refreshToken: string; accessToken: string } => {
  try {
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
    return { refreshToken, accessToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
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
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }
   
    const newUser: IUser = new User({ username, email, password });
    await newUser.save();
    const { accessToken, refreshToken } = generateToken(newUser._id.toString());
    res
      .status(201)
      .json({
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
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const { accessToken, refreshToken } = generateToken(user._id.toString());
    res
      .status(200)
      .json({ message: "Login successful", user, accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", error);
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
          console.error("Refresh token verification error:", err);
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        try {
          const userId = (decoded as RefreshTokenPayload).userId;
          const { accessToken, refreshToken: newRefreshToken } =
            generateToken(userId);
          return res
            .status(200)
            .json({ accessToken, refreshToken: newRefreshToken });
        } catch (error) {
          console.error("Error generating new tokens:", error);
          return res
            .status(500)
            .json({ message: "Error generating new tokens", error });
        }
      }
    );
  } catch (error) {
    console.error("Unhandled error in refreshAccessToken:", error);
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


export const changePassword = async(req:Request,res:Response):Promise<unknown>=>{
  const {oldPassword,newPassword}= req.body;
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
    return res.status(200).json({message:"Password changed successfully"});
  } catch (error) {
    return res.status(500).json({ message: "Error changing password", error });
  }
}

export const allFoldersAndFiles = async (req: Request, res: Response) => {
    try {
        const  userId  = (req as any).userId;
        
        const foldersCount = await Folder.countDocuments({ ownerId: userId });
        const filesCount = await FileModel.countDocuments({ owner: userId });
          const all_files = await FileModel.find({ owner: userId });
          const totalStorageUsed = all_files.reduce((accumulator, file) => {
            return accumulator + (file.size || 0);
          }, 0);
       
        res.status(200).json({ totalFolders: foldersCount, totalFiles: filesCount, totalStorageUsed: totalStorageUsed });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};