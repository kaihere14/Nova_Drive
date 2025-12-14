import mongoose from "mongoose";
import { logger } from "../index.js";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI!;
    await mongoose.connect(mongoURI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      waitQueueTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    });
    logger.info("MongoDB connected successfully");

    // Listen for connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
