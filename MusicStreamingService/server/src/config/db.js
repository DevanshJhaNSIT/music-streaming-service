import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }

  const connectionUri = uri === "memory" ? await getMemoryUri() : uri;

  mongoose.set("strictQuery", true);
  await mongoose.connect(connectionUri);
  console.log(uri === "memory" ? "In-memory MongoDB connected" : "MongoDB connected");
}

async function getMemoryUri() {
  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: "music_streaming_service"
    }
  });

  return memoryServer.getUri();
}

export async function disconnectDB() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
