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
  // Fix for Windows/XAMPP c-ares DNS issue with MongoDB Atlas SRV resolution
  // Uses require() so webpack never bundles the Node-only 'dns' module for the client
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('dns') as typeof import('dns')).setServers(['8.8.8.8', '8.8.4.4']);
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000,
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
