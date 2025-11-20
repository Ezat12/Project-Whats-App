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

export const updateLastMessage = async (
  chatId: string,
  senderId: string,
  lastMessage: string,
  type: string = "text"
) => {
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      lastMessageSender: senderId,
      lastMessage,
      lastMessageType: type,
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!chat) {
    throw new ApiError("Chat not found", 404);
  }

  return chat;
};

export const deleteChat = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;

    await Chat.findByIdAndDelete(chatId);

    res
      .status(200)
      .json({ status: "success", message: "Chat deleted successfully" });
  }
);
