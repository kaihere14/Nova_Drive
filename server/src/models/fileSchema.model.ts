import { Schema, model, Document } from "mongoose";

export interface IFile extends Document {
  key: string;
  eTag?: string;
  owner: Schema.Types.ObjectId;
  uploadId?: string;
  createdAt: Date;
}

const FileSchema = new Schema<IFile>({
  key: { type: String, required: true, unique: true },
  eTag: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default model<IFile>("File", FileSchema);
