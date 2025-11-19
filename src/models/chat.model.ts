import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Users",
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageSender: { type: mongoose.Schema.ObjectId, ref: "Users" },
    lastMessageType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
  },
  { timestamps: true }
);

chatSchema.index({ members: 1 });

chatSchema.index({ members: 1, updatedAt: -1 });

export const Chat = mongoose.model("Chat", chatSchema);
