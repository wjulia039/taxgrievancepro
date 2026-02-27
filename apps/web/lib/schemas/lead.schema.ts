import { z } from "zod";

export const LeadSubmitRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  tag: z.string().min(1, "Tag is required"),
  county: z.enum(["Suffolk", "Nassau", "Unknown"]).optional(),
});

export type LeadSubmitRequest = z.infer<typeof LeadSubmitRequestSchema>;
