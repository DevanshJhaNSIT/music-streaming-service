import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import Song from "./models/Song.js";
import { seedDemoData } from "./seed.js";

dotenv.config();

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    return seedMemoryDatabase();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start API", error);
    process.exit(1);
  });

async function seedMemoryDatabase() {
  if (process.env.MONGODB_URI !== "memory") {
    return;
  }

  const songCount = await Song.countDocuments();
  if (songCount === 0) {
    await seedDemoData();
  }
}
