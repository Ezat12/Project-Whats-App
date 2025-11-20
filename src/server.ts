import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

// Routes
app.use("/api/auth", authRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`server is ready on port ${port}`);
});
