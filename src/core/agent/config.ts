export const BASE_URL: string =
  getEnv("WXT_UPSTAGE_API_BASE_URL") ?? "https://api.upstage.ai/v2";

export const AGENT_ID: string =
  getEnv("WXT_UPSTAGE_AGENT_ID") ?? "agt_7cXzMrfKztTqLUvyjHNSyS";

export const AGENT_VERSION = "v0.22" as const;

function getEnv(name: string): string | undefined {
  // WXT injects env vars as `import.meta.env.WXT_*`
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
