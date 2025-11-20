import express from "express";
import {
  createChat,
  deleteChat,
  getChatById,
  getUserChats,
} from "../controllers/chat.controller";
import { validationChat } from "../middlewares/validation/chat";

const router = express.Router();

router.post("/", validationChat, createChat);

router.get("/user/:userId", getUserChats);

router.get("/:chatId", getChatById);

router.delete("/:chatId", deleteChat);

export default router;
