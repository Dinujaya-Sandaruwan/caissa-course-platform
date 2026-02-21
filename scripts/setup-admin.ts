import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
  process.exit(1);
}

async function setupAdmin() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB database.");

    // Find the existing manager we created
    const existingManager = await User.findOne({ role: "manager" });

    if (existingManager) {
      console.log(`Found manager: ${existingManager.name}`);

      const adminUsername = "admin";
      const adminPasswordRaw = "CaissaAdmin2026!";
      const hashedPassword = await bcrypt.hash(adminPasswordRaw, 10);

      existingManager.username = adminUsername;
      existingManager.password = hashedPassword;
      await existingManager.save();

      console.log("Successfully updated manager with username and password!");
      console.log("----------------------------------------");
      console.log(`Username: ${adminUsername}`);
      console.log(`Password: ${adminPasswordRaw}`);
      console.log("----------------------------------------");
    } else {
      console.log("No manager found. Please run seed-manager.ts first.");
    }
  } catch (error) {
    console.error("Error setting up admin:", error);
    process.exit(1);
  } finally {
    console.log("\nDisconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("Disconnected. Exiting.");
    process.exit(0);
  }
}

setupAdmin();
