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
    logger.info("mongodb_connected", {
      host: mongoURI.split('@')[1]?.split('/')[0] || 'unknown',
    });

    // Listen for connection events
    mongoose.connection.on("error", (err) => {
      logger.error("mongodb_connection_error", {
        error: err.message,
        stack: err.stack,
      });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("mongodb_disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("mongodb_reconnected");
    });
  } catch (error: any) {
    logger.error("mongodb_connection_failed", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
