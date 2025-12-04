import {model, Schema, Document} from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  storageQuota: number; // Storage quota in bytes
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  storageQuota: { type: Number, default: 10 * 1024 * 1024 * 1024 }, // Default 10 GB
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (inputPassword: string): Promise<boolean> {
   
      return bcrypt.compare(inputPassword, this.password);
   
};
export const User = model<IUser>('User', UserSchema);