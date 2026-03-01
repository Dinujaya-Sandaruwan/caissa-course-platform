const { connectDB } = require("./src/lib/db");
const Tag = require("./src/models/Tag").default || require("./src/models/Tag");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: ".env.local" });

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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully.");

    let added = 0;

    for (const tagName of COMMON_CHESS_TAGS) {
      const result = await Tag.findOneAndUpdate(
        { name: tagName },
        { $setOnInsert: { name: tagName, usageCount: 0 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      if (result.isNew || result.usageCount === 0) {
        added++;
      }
    }

    console.log(
      `Successfully ensured ${COMMON_CHESS_TAGS.length} tags exist in the database.`,
    );
    console.log(`${added} tags were newly added.`);
  } catch (error) {
    console.error("Error seeding tags:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  }
}

seedTags();
