import { BASE_URL } from "../agent/config";
import { buildSolarUserPrompt, SOLAR_SYSTEM_PROMPT } from "./prompts";
import {
  SOLAR_ANSWER_JSON_SCHEMA,
  solarChatResponseSchema,
  solarStructuredAnswerSchema,
} from "./schemas";
import type { SolarAnswer, SolarAnswerInput } from "./types";

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    if (body.error?.message) return body.error.message;
  } catch {
    // Use the status fallback below.
  }
  return `Upstage Solar API ${response.status}: ${response.statusText}`;
}

export async function requestSolarAnswer(input: SolarAnswerInput): Promise<SolarAnswer> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "solar-pro4",
      messages: [
        { role: "system", content: SOLAR_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildSolarUserPrompt({
            question: input.question,
            relevantChunks: input.relevantChunks,
            candidateSources: input.candidateSources,
            ...(input.extractFacts ? { extractFacts: input.extractFacts } : {}),
            ...(input.userProfile ? { userProfile: input.userProfile } : {}),
          }),
        },
      ],
      reasoning_effort: "minimal",
      max_tokens: 1200,
      response_format: {
        type: "json_schema",
        json_schema: SOLAR_ANSWER_JSON_SCHEMA,
      },
    }),
  });

  if (!response.ok) throw new Error(await errorMessage(response));
  const body = solarChatResponseSchema.parse(await response.json());
  const choice = body.choices[0];
  if (!choice || choice.finish_reason !== "stop" || choice.message.content == null) {
    throw new Error("Solar structured output이 완결되지 않았습니다");
  }
  const parsed = solarStructuredAnswerSchema.parse(JSON.parse(choice.message.content));
  return {
    answer: parsed.answer,
    ...(parsed.decision ? { decision: parsed.decision } : {}),
    evidenceSourceIds: parsed.evidenceSourceIds,
    missingInformation: parsed.missingInformation,
    nextActions: parsed.nextActions,
  };
}
