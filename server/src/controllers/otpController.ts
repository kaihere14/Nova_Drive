import { Otp } from "../models/otpModel.js";
import { Request, Response } from "express";
import { sendOtpEmail } from "../utils/resendController.js";



export const createOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        console.log("Generated OTP:", generatedOtp ,"with expiry", otpExpiry);
        
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
            // Remove otp from response in production for security
            ...(process.env.NODE_ENV === 'development' && { otp: generatedOtp })
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