import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is required");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error", error.message);
    process.exit(1);
  }
};

export default connectDb;
