import { Schema ,model} from "mongoose";

const hashSchema = new Schema({
  fileHash: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "24h" }, // Expire after 24 hours
});

const Hash = model("Hash", hashSchema);

export default Hash;