import { z } from "zod";

z.config({ jitless: true });

export const upstageFileSchema = z.object({
  id: z.string(),
  object: z.string(),
  bytes: z.number(),
  created_at: z.number(),
  expires_at: z.number().nullable(),
  filename: z.string(),
  purpose: z.string(),
});

export type UpstageFile = z.infer<typeof upstageFileSchema>;

export const outputTextSchema = z.object({
  type: z.literal("output_text"),
  text: z.string(),
  additional_values: z.unknown().optional(),
});

export type OutputText = z.infer<typeof outputTextSchema>;

export const outputItemSchema = z.object({
  id: z.string(),
  type: z.enum(["message"]),
  status: z.enum(["completed", "in_progress", "queued", "failed"]),
  role: z.literal("assistant"),
  model: z.string(),
  content: z.array(outputTextSchema),
  progress: z
    .object({
      total: z.number(),
      completed: z.number(),
      percentage: z.number(),
    })
    .optional(),
});

export type OutputItem = z.infer<typeof outputItemSchema>;

export const agentJobSchema = z.object({
  id: z.string(),
  object: z.string(),
  created_at: z.number(),
  status: z.enum(["queued", "in_progress", "completed", "failed"]),
  model: z.string(),
  output: z.array(outputItemSchema),
  usage: z
    .object({
      input_tokens: z.number().optional(),
      output_tokens: z.number().optional(),
      total_tokens: z.number().optional(),
    })
    .optional(),
  error: z.unknown().nullable().optional(),
});

export type AgentJob = z.infer<typeof agentJobSchema>;
