import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global variable to store the connection
declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // MongoDB Atlas replica set connection options
    const opts = {
      bufferCommands: false,
      // Connection pool settings for better performance
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a socket stays open
      // Write concern for data durability (Atlas replica set)
      writeConcern: {
        w: "majority" as const, // Wait for majority of replica set members to acknowledge
        j: true, // Wait for write to be written to journal
        wtimeout: 10000, // Timeout after 10 seconds
      },
      // Read preference for load balancing across replica set
      readPreference: "primaryPreferred" as const, // Read from primary, fallback to secondary
      // Retry writes automatically if they fail
      retryWrites: true,
      // Retry reads automatically if they fail
      retryReads: true,
      // Use new connection management
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Atlas connected successfully");
      console.log(`📊 Connection state: ${mongoose.connection.readyState}`);
      console.log(`🔗 Database: ${mongoose.connection.db?.databaseName}`);

      // Log replica set status
      if (mongoose.connection.db) {
        mongoose.connection.db
          .admin()
          .replSetGetStatus()
          .then((status) => {
            console.log(
              `🔄 Replica Set: ${status.set} (${status.members.length} members)`
            );
          })
          .catch(() => {
            // Not a replica set or no permissions to check
            console.log(
              "🔗 Connected to MongoDB (single instance or managed replica set)"
            );
          });
      }

      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
}

// Export additional connection utilities
export const connectMongoDB = dbConnect;

export default dbConnect;
