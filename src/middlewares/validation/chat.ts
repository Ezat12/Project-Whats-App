import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { chatValidationSchema } from "../../validations/chatValidation";
import { ZodError } from "zod";

export const validationChat = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = await chatValidationSchema.parseAsync(req.body);
    } catch (e) {
      if (e instanceof ZodError) {
        const uniqueErrors: Record<string, string> = {};

        e.issues.forEach((err) => {
          const field: string = err.path.join(".");
          if (!uniqueErrors[field]) {
            uniqueErrors[field] = err.message;
          }
        });

        const errors = Object.entries(uniqueErrors).map(([field, message]) => ({
          field,
          message,
        }));

        res.status(400).json({ status: "error", errors });
      }

      res
        .status(500)
        .json({ status: "error", message: "Something went wrong" });
    }
  }
);
