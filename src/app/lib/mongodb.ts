// lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options: any = {};

let _client: MongoClient | undefined;
let _clientPromise: Promise<MongoClient> | undefined;

// Export a function that returns a Promise<MongoClient>. This avoids throwing
// during module evaluation (which breaks builds on platforms that inspect
// server files at build time) while still providing a clear error when the
// function is actually used at runtime without the env var configured.
export default function getClient(): Promise<MongoClient> {
  if (!_clientPromise) {
    if (!uri) {
      console.error("CRITICAL: MONGODB_URI is not set");
      throw new Error("Add MONGODB_URI to .env.local");
    }

    console.log("Connecting to MongoDB. NODE_ENV:", process.env.NODE_ENV);

    if (process.env.NODE_ENV === "development") {
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        console.log("Creating new MongoDB connection (development)");
        _client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = _client.connect();
      }
      _clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      console.log("Creating new MongoDB connection (production)");
      _client = new MongoClient(uri, options);
      _clientPromise = _client.connect().catch((err) => {
        console.error("MongoDB connection error:", err.message);
        throw err;
      });
    }
  }

  return _clientPromise!;
}
