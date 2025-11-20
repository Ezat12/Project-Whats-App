import { z } from "zod";

// Phone number validation schema
export const sendCodeSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+[1-9]\d{9,14}$/, "Phone number must start with + and country code"),
});

// Verify code schema
export const verifyCodeSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{9,14}$/, "Invalid phone number format"),
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only digits"),
});

// Complete profile schema
export const completeProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim(),
  profilePicture: z
    .string()
    .url("Invalid profile picture URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(150, "Description must not exceed 150 characters")
    .optional()
    .or(z.literal("")),
});

// Update profile schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim()
    .optional(),
  profilePicture: z
    .string()
    .url("Invalid profile picture URL")
    .optional(),
  description: z
    .string()
    .max(150, "Description must not exceed 150 characters")
    .optional(),
});

export type SendCodeInput = z.infer<typeof sendCodeSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
