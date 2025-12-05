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
      throw new Error("Add MONGODB_URI to .env.local");
    }

    if (process.env.NODE_ENV === "development") {
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        _client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = _client.connect();
      }
      _clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      _client = new MongoClient(uri, options);
      _clientPromise = _client.connect();
    }
  }

  return _clientPromise!;
}
