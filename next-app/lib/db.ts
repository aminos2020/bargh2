import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tavanban";

let cached = (globalThis as unknown as { _mongo?: typeof mongoose })._mongo;

export async function connectDb(): Promise<typeof mongoose> {
  if (cached?.connection.readyState === 1) return cached;
  cached = await mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });
  (globalThis as unknown as { _mongo?: typeof mongoose })._mongo = cached;
  return cached;
}

export { mongoose };
