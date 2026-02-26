import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length !== 4) {
  console.error(
    "Usage: npx tsx scripts/seed-manager.ts <name> <whatsappNumber> <username> <password>",
  );
  console.error(
    "Example: npx tsx scripts/seed-manager.ts 'Admin' '94701234567' 'admin1' 'Password123!'",
  );
  process.exit(1);
}

const [name, whatsappNumber, username, password] = args;

async function seedManager() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB database.");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ whatsappNumber }, { username }],
    });

    if (existingUser) {
      console.log(
        `\nUser with WhatsApp number ${whatsappNumber} or username ${username} already exists.`,
      );
      console.log(`Updating existing user to manager with new credentials...`);
      existingUser.role = "manager";
      existingUser.name = name;
      existingUser.username = username;
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log("Successfully updated user to manager role.");
    } else {
      console.log(`\nCreating new manager: ${name} (${username})...`);
      const manager = new User({
        name,
        whatsappNumber,
        username,
        password: hashedPassword,
        role: "manager",
        status: "active",
      });
      await manager.save();
      console.log("Successfully created new manager account.");
    }

    console.log("\n--- MANAGER CREDENTIALS ---");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`WhatsApp: ${whatsappNumber}`);
    console.log("---------------------------\n");
  } catch (error) {
    console.error("Error seeding manager:", error);
    process.exit(1);
  } finally {
    console.log("Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("Disconnected. Exting.");
    process.exit(0);
  }
}

seedManager();
