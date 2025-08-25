import mongoose from "mongoose";

// Simple seeder script for development
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/sih-reg"
    );
    console.log("Connected to MongoDB");

    // Define simplified schemas for seeding
    const ProblemStatement = mongoose.model(
      "ProblemStatement",
      new mongoose.Schema({
        psNumber: String,
        title: String,
        description: String,
        domain: String,
        link: String,
        teamCount: { type: Number, default: 0 },
        maxTeams: { type: Number, default: 3 },
        isActive: { type: Boolean, default: true },
      })
    );

    // Clear existing data
    await ProblemStatement.deleteMany({});
    console.log("Cleared existing problem statements");

    // Sample problem statements
    const samplePS = [
      {
        psNumber: "SIH001",
        title: "AI for Agriculture",
        description:
          "Create an AI model to detect crop diseases using image recognition and provide treatment recommendations to farmers.",
        domain: "Smart Agriculture",
        link: "https://example.com/problem-statement-1",
        maxTeams: 3,
        isActive: true,
      },
      {
        psNumber: "SIH002",
        title: "Blockchain for Healthcare",
        description:
          "Develop a secure blockchain-based system for managing patient medical records and ensuring data privacy.",
        domain: "HealthTech",
        link: "https://example.com/problem-statement-2",
        maxTeams: 3,
        isActive: true,
      },
      {
        psNumber: "SIH003",
        title: "Smart Traffic Management",
        description:
          "Design an intelligent traffic management system using IoT sensors and machine learning algorithms.",
        domain: "Smart Transportation",
        link: "https://example.com/problem-statement-3",
        maxTeams: 3,
        isActive: true,
      },
      {
        psNumber: "SIH004",
        title: "Digital Education Platform",
        description:
          "Build a comprehensive digital learning platform with adaptive learning capabilities for rural students.",
        domain: "Education Technology",
        link: "https://example.com/problem-statement-4",
        maxTeams: 3,
        isActive: true,
      },
      {
        psNumber: "SIH005",
        title: "Fintech for Financial Inclusion",
        description:
          "Create a mobile-first financial services platform to provide banking services to underbanked populations.",
        domain: "Financial Technology",
        link: "https://example.com/problem-statement-5",
        maxTeams: 3,
        isActive: true,
      },
    ];

    // Insert sample data
    await ProblemStatement.insertMany(samplePS);
    console.log(`Inserted ${samplePS.length} sample problem statements`);

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
