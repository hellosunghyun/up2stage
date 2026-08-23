import { z } from "zod";

z.config({ jitless: true });

export const solarStructuredAnswerSchema = z.object({
  answer: z.string(),
  decision: z
    .enum(["eligible", "ineligible", "needs_more_information", "conflict"])
    .nullable(),
  evidenceSourceIds: z.array(z.string()),
  missingInformation: z.array(z.string()),
  nextActions: z.array(z.string()),
});

export const solarChatResponseSchema = z.object({
  choices: z.array(
    z.object({
      finish_reason: z.string(),
      message: z.object({
        content: z.string().nullable(),
      }),
    })
  ),
});

export const SOLAR_ANSWER_JSON_SCHEMA = {
  name: "up2stage_solar_answer",
  strict: true,
  schema: {
    type: "object",
    properties: {
      answer: { type: "string" },
      decision: {
        type: ["string", "null"],
        enum: ["eligible", "ineligible", "needs_more_information", "conflict", null],
      },
      evidenceSourceIds: {
        type: "array",
        items: { type: "string" },
      },
      missingInformation: {
        type: "array",
        items: { type: "string" },
      },
      nextActions: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "answer",
      "decision",
      "evidenceSourceIds",
      "missingInformation",
      "nextActions",
    ],
    additionalProperties: false,
  },
} as const;
