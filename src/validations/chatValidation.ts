import { z } from "zod";

export const chatValidationSchema = z.object({
  members: z
    .array(z.string().length(30))
    .nonempty("Chat must be have a least one member"),

  lastMessage: z.string().optional(),
});
