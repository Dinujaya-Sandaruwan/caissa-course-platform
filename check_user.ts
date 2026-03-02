import mongoose from "mongoose";
import User from "./src/models/User";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const user = await User.findById("69a53e6e5274f7cea64d5e93");
  console.log("User:", user);
  process.exit(0);
}
check();
