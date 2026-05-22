import mongoose from 'mongoose';

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedMongoose | undefined;
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
const cache = cached as CachedMongoose;

export async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside the Vercel project settings');
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 1,          // Keep pool small for serverless
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,               // Force IPv4 — avoids DNS/IPv6 issues on Vercel
    }).then((m) => m);
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    // Clear the cached promise so the next request gets a fresh attempt
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
