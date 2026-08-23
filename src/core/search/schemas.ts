import { z } from "zod";

z.config({ jitless: true });

export const vectorStoreSchema = z.object({
  id: z.string(),
  status: z.string(),
});

export const vectorStoreFileSchema = z.object({
  id: z.string(),
  status: z.enum(["in_progress", "completed", "failed", "cancelled"]),
  last_error: z.unknown().nullable().optional(),
});

export const vectorSearchResponseSchema = z.object({
  data: z.array(
    z.object({
      filename: z.string(),
      score: z.number(),
      content: z.array(
        z.object({
          type: z.literal("text"),
          text: z.string(),
        })
      ),
    })
  ),
});

export type VectorStore = z.infer<typeof vectorStoreSchema>;
export type VectorStoreFile = z.infer<typeof vectorStoreFileSchema>;
