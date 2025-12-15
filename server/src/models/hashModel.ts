import { Schema, model } from "mongoose";

const hashSchema = new Schema({
  fileHash: { type: String, required: true, unique: true,index: true },
  sessionId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Expire after 5 minutes (300 seconds)
});

const Hash = model("Hash", hashSchema);

export default Hash;
