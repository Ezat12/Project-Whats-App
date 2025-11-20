import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "../models/user.model";
import { Chat } from "../models/chat.model";
import { SMSService } from "../services/sms.service";
import { JWTService } from "../services/jwt.service";
import { ApiError } from "../utils/apiError";

/**
 * @desc    Send verification code to phone number
 * @route   POST /api/auth/send-code
 * @access  Public
 */
export const sendVerificationCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber } = req.body;

    // Validate phone number format
    if (!SMSService.isValidPhoneNumber(phoneNumber)) {
      throw new ApiError("Invalid phone number format", 400);
    }

    // Check if user exists
    let user = await User.findOne({ phoneNumber });

    // Generate verification code
    const code = SMSService.generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      // Update existing user
      user.verificationCode = code;
      user.verificationCodeExpiry = codeExpiry;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        phoneNumber,
        verificationCode: code,
        verificationCodeExpiry: codeExpiry,
        isVerified: false,
      });
    }

    // Send SMS
    await SMSService.sendVerificationCode(phoneNumber, code);

    res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
      data: {
        phoneNumber,
        expiresIn: "10 minutes",
      },
    });
  }
);

/**
 * @desc    Verify code and login/register user
 * @route   POST /api/auth/verify-code
 * @access  Public
 */
export const verifyCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber, code } = req.body;

    // Find user
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Check if code is expired
    if (
      !user.verificationCodeExpiry ||
      user.verificationCodeExpiry < new Date()
    ) {
      throw new ApiError("Verification code has expired", 400);
    }

    // Verify code
    const isValidCode = await user.comparePassword(code);

    if (!isValidCode) {
      throw new ApiError("Invalid verification code", 400);
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = JWTService.generateToken({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
    });

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      data: {
        token,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete,
          name: user.name,
          profilePicture: user.profilePicture,
          description: user.description,
        },
      },
    });
  }
);

/**
 * @desc    Complete user profile
 * @route   POST /api/auth/complete-profile
 * @access  Private (requires authentication)
 */
export const completeProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, profilePicture, description } = req.body;
    const userId = req.userId;

    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }

    // Find and update user
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Update profile
    user.name = name;
    user.profilePicture = profilePicture || undefined;
    user.description = description || undefined;
    user.isProfileComplete = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          profilePicture: user.profilePicture,
          description: user.description,
          isProfileComplete: user.isProfileComplete,
        },
      },
    });
  }
);

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }

    const user = await User.findById(userId).select("-verificationCode");

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          profilePicture: user.profilePicture,
          description: user.description,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete,
        },
      },
    });
  }
);

/**
 * @desc    Update user profile
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, profilePicture, description } = req.body;
    const userId = req.userId;

    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Update only provided fields
    if (name !== undefined) user.name = name;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (description !== undefined) user.description = description;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          profilePicture: user.profilePicture,
          description: user.description,
          isProfileComplete: user.isProfileComplete,
        },
      },
    });
  }
);

/**
 * @desc    Load user chats
 * @route   GET /api/auth/chats
 * @access  Private (requires complete profile)
 */
export const loadUserChats = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new ApiError("User not authenticated", 401);
    }

    // Find all chats where user is a member
    const chats = await Chat.find({
      members: userId,
    })
      .populate("members", "name phoneNumber profilePicture")
      .populate("lastMessageSender", "name")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Chats loaded successfully",
      data: {
        chats,
        totalChats: chats.length,
      },
    });
  }
);
