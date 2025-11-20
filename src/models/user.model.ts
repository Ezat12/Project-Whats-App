import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  phoneNumber: string;
  name?: string;
  profilePicture?: string;
  description?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 150,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpiry: {
      type: Date,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash verification code before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("verificationCode") || !this.verificationCode) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.verificationCode = await bcrypt.hash(this.verificationCode, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare verification codes
userSchema.methods.comparePassword = async function (
  candidateCode: string
): Promise<boolean> {
  if (!this.verificationCode) return false;
  return await bcrypt.compare(candidateCode, this.verificationCode);
};

export const User = mongoose.model<IUser>("User", userSchema);
