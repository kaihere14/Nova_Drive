import { model, Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // ✅ Optional now
  storageUsed?: number;
  storageQuota: number;
  createdAt: Date;
  otp?: string;
  otpExpiry?: Date;

  // ✅ OAuth Fields
  googleId?: string;
  avatar?: string;
  authProvider: "local" | "google";

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  
  password: { type: String, required: false },

  storageUsed: { type: Number, default: 0 },
  storageQuota: { type: Number, default: 10 * 1024 * 1024 * 1024 },
  createdAt: { type: Date, default: Date.now },

  otp: { type: String },
  otpExpiry: { type: Date },

 
  googleId: { type: String },
  avatar: { type: String },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
});



UserSchema.pre<IUser>("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


UserSchema.methods.comparePassword = function (
  inputPassword: string
): Promise<boolean> {
  if (!this.password) {
    throw new Error("This account uses Google login");
  }
  return bcrypt.compare(inputPassword, this.password);
};

export const User = model<IUser>("User", UserSchema);
