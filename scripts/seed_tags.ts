import mongoose from "mongoose";
import dotenv from "dotenv";
import Tag from "../src/models/Tag";

import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const COMMON_CHESS_TAGS = [
  // General phases
  "Opening",
  "Middlegame",
  "Endgame",

  // Openings
  "Openings",
  "Sicilian Defense",
  "King's Pawn Opening",
  "Queen's Pawn Opening",
  "French Defense",
  "Caro-Kann Defense",
  "Spanish Game",
  "Ruy Lopez",
  "Italian Game",
  "Queen's Gambit",
  "Slav Defense",
  "King's Indian Defense",
  "Nimzo-Indian Defense",
  "English Opening",
  "Reti Opening",

  // Concepts & Strategy
  "Strategy",
  "Positional Play",
  "Tactics",
  "Calculation",
  "Combinations",
  "Checkmate Patterns",
  "Pawn Structure",
  "Piece Activity",
  "Center Control",
  "King Safety",
  "Prophylaxis",
  "Initiative",
  "Attacking Chess",
  "Defensive Chess",

  // Endgame specific
  "Pawn Endgames",
  "Rook Endgames",
  "Minor Piece Endgames",
  "Theoretical Endgames",
  "Practical Endgames",

  // Mechanics
  "Forks",
  "Pins",
  "Skewers",
  "Discovered Attacks",
  "Sacrifices",

  // Demographics/Level
  "Beginner",
  "Intermediate",
  "Advanced",
  "Master Level",
  "Club Player",
  "Scholastic",
  "Kids",
  "Tournament Preparation",
];

async function seedTags() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected successfully.");

    let added = 0;

    for (const tagName of COMMON_CHESS_TAGS) {
      const result = await Tag.findOneAndUpdate(
        { name: tagName },
        { $setOnInsert: { name: tagName, usageCount: 0 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      // Mongoose 6+ returns the document. If it was inserted, the createdAt and updatedAt will be roughly identical.
      // Alternatively, we can just say "ensured" rather than strictly tracking new adds if we don't use raw updates.
      // But for simple logging, we'll just log success.
    }

    console.log(
      `Successfully ensured ${COMMON_CHESS_TAGS.length} tags exist in the database.`,
    );
  } catch (error) {
    console.error("Error seeding tags:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  }
}

seedTags();
