import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { Chat } from "../models/chat.model";
import { ApiError } from "../utils/apiError";

export const createChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    const chat = await Chat.create({
      members: body.members,
      lastMessage: body.lastMessage ?? null,
    });

    res.status(201).json({ status: "success", data: chat });
  }
);

export const getUserChats = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await Chat.findById(userId); // User

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const chatUser = await Chat.find({ members: user._id }).populate("members");

    res.status(200).json({ status: "success", data: chatUser });
  }
);

export const getChatById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId).populate("members");

    if (!chat) {
      return next(new ApiError("Chat not found", 404));
    }

    // Message unRead =====

    res.status(200).json({ status: "success", data: chat });
  }
);

export const updateLastMessage = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
  }
);
