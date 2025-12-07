import { model, Schema,Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  otpExpiry: Date;
  createdAt: Date;
 
}
const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required:true },
  otpExpiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  
});

export const Otp = model<IOtp>("Otp", OtpSchema);