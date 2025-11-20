import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { JWTService } from "../services/jwt.service";
import { User, IUser } from "../models/user.model";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError("Authentication token is missing", 401);
    }

    // Verify token
    const decoded = JWTService.verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (!user.isVerified) {
      throw new ApiError("Phone number not verified", 403);
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error.message === "Invalid or expired token") {
      next(new ApiError("Invalid or expired token", 401));
    } else {
      next(new ApiError("Authentication failed", 401));
    }
  }
};

// Middleware to check if profile is complete
export const requireCompleteProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new ApiError("Authentication required", 401);
    }

    if (!req.user.isProfileComplete) {
      throw new ApiError("Please complete your profile first", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
