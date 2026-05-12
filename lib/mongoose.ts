import mongoose from 'mongoose';

<<<<<<< Updated upstream
interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedMongoose | undefined;
}
=======
type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
let cached = (global as unknown as { mongoose?: MongooseCache }).mongoose;
>>>>>>> Stashed changes

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
    }).then((m) => m);
<<<<<<< Updated upstream
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    // Clear the cached promise so the next request gets a fresh attempt
    cache.promise = null;
    throw err;
=======
>>>>>>> Stashed changes
  }
  return cache.conn;
}
