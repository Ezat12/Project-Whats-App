import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB";
import { errorHandler } from "./middlewares/errorHandler";
dotenv.config();

const app = express();

app.use(express.json());

connectDB();

app.use(errorHandler);

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`server is ready on port ${port}`);
});
