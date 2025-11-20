import express from "express";
import {
  sendVerificationCode,
  verifyCode,
  completeProfile,
  getCurrentUser,
  updateProfile,
  loadUserChats,
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validation/auth";
import {
  sendCodeSchema,
  verifyCodeSchema,
  completeProfileSchema,
  updateProfileSchema,
} from "../validations/authValidation";
import {
  authMiddleware,
  requireCompleteProfile,
} from "../middlewares/auth.middleware";

const router = express.Router();

// Public routes
router.post("/send-code", validate(sendCodeSchema), sendVerificationCode);
router.post("/verify-code", validate(verifyCodeSchema), verifyCode);

// Protected routes (require authentication)
router.post(
  "/complete-profile",
  authMiddleware,
  validate(completeProfileSchema),
  completeProfile
);
router.get("/me", authMiddleware, getCurrentUser);
router.patch(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile
);

// Protected routes (require complete profile)
router.get("/chats", authMiddleware, requireCompleteProfile, loadUserChats);

export default router;
