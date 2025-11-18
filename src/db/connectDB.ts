import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = () => {
  if (!process.env.URI_DB) {
    throw new Error("Missing URI in .env");
  }

  const uri: string = process.env.URI_DB;

  mongoose
    .connect(uri)
    .then(() => {
      console.log("connection DB");
    })
    .catch((e) => {
      console.log("error DB", e);
    });
};
