import { Otp } from "../models/otpModel.js";
import { Request, Response } from "express";
import { sendOtpEmail } from "../utils/resendController.js";
import { User } from "../models/user.model.js";



export const createOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        
        
        // Save OTP to database
        const newOtp = new Otp({ email, otp: generatedOtp, otpExpiry });
        await newOtp.save();
        
        // Send OTP via email
        const emailResult = await sendOtpEmail({ email, otp: generatedOtp });
        
        if (!emailResult.success) {
            return res.status(500).json({ 
                message: "OTP created but failed to send email", 
                error: emailResult.error 
            });
        }
        
        res.status(201).json({ 
            message: "OTP sent to your email successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating OTP", error });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const existingOtp = await Otp.findOne({ email, otp });
        if (!existingOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (existingOtp.otpExpiry  < new Date()) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        await Otp.deleteOne({ _id: existingOtp._id });
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
};

export const forgotOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        // Update or create OTP in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }
        if(user.authProvider=="google"){
            return res.status(400).json({ message: "Cannot reset password for Google OAuth users" });
        }
        user.otp = generatedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();
        // Send OTP via email
        const emailResult = await sendOtpEmail({ email, otp: generatedOtp });
        if (!emailResult.success) {
            return res.status(500).json({ 
                message: "OTP created but failed to send email",
                error: emailResult.error 
            });
        }
        res.status(201).json({ 
            message: "OTP sent to your email successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating OTP", error });
    }
};

