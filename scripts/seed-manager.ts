import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error(
    "Usage: npx ts-node scripts/seed-manager.ts <name> <whatsappNumber>",
  );
  console.error(
    "Example: npx ts-node scripts/seed-manager.ts 'John Doe' '94701234567'",
  );
  process.exit(1);
}

const [name, whatsappNumber] = args;

async function seedManager() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB database.");

    // Check for existing user
    const existingUser = await User.findOne({ whatsappNumber });

    if (existingUser) {
      console.log(
        `\nUser with WhatsApp number ${whatsappNumber} already exists.`,
      );
      if (existingUser.role !== "manager") {
        console.log(`Updating role of existing user to manager...`);
        existingUser.role = "manager";
        await existingUser.save();
        console.log("Successfully updated user to manager role.");
      } else {
        console.log("User is already a manager.");
      }
    } else {
      console.log(`\nCreating new manager: ${name} (${whatsappNumber})...`);
      const manager = new User({
        name,
        whatsappNumber,
        role: "manager",
        status: "active",
      });
      await manager.save();
      console.log("Successfully created new manager account.");
    }
  } catch (error) {
    console.error("Error seeding manager:", error);
    process.exit(1);
  } finally {
    console.log("\nDisconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("Disconnected. Exting.");
    process.exit(0);
  }
}

seedManager();
