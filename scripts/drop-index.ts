import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collections = await db!.collections();
    const usersCollection = collections.find(
      (c) => c.collectionName === "users",
    );

    if (usersCollection) {
      try {
        await usersCollection.dropIndex("whatsappNumber_1");
        console.log("Successfully dropped 'whatsappNumber_1' index.");
      } catch (e: any) {
        console.log("Index might not exist or already dropped:", e.message);
      }
    } else {
      console.log("Users collection not found.");
    }
  } catch (error) {
    console.error("Error connecting to DB:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
