
import mongoose, { Connection } from "mongoose";
import logger from "./logger.config";
import { serverConfig } from ".";


class MongoConnection {
  private connection: Connection | null = null;
  
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      if (this.connection) {
        return this.connection;
      }

      await mongoose.connect(serverConfig.DB_URI, {
        maxPoolSize: 20,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000, // fail fast
        socketTimeoutMS: 45000, // allow time for long operations
      });

      this.connection = mongoose.connection;

      this.connection.on("error", (err: any) => {
        logger.error("MongoDB connection error:", err);
      });

      this.connection.on("disconnected", () => {
        logger.info("MongoDB disconnected");
      });

      logger.info("MongoDB connected");
      return this.connection;
    } catch (error) {
      logger.error("Error connecting to the database:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.connection = null;
      logger.info("MongoDB connection closed");
    } catch (error) {
      logger.error("Error closing MongoDB connection:", error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }
}

export const mongoConnection = new MongoConnection();
