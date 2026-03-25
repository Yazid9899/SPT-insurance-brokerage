import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const apiErrorSchema = z.object({
  error: z.string(),
  details: z.record(z.unknown()).optional(),
});
