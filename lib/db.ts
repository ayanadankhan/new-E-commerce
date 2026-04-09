// PURPOSE: Mongoose singleton connection for Next.js serverless and hot-reload safety.

import mongoose from "mongoose";

const DEFAULT_DEV_MONGODB_URI =
  "mongodb://127.0.0.1:27017/nexus-commerce";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) {
    return uri;
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[db] MONGODB_URI is unset; using default local URI. Set MONGODB_URI in .env.local for a custom database."
    );
    return DEFAULT_DEV_MONGODB_URI;
  }
  throw new Error(
    "Please define the MONGODB_URI environment variable (e.g. in .env.local). See .env.example."
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
