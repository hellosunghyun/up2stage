const API_KEY_KEY = "up2stage_apiKey";

export async function getApiKey(): Promise<string | null> {
  const value = await chrome.storage.session.get(API_KEY_KEY);
  const key = value[API_KEY_KEY];
  return typeof key === "string" ? key : null;
}

export async function setApiKey(apiKey: string): Promise<void> {
  await chrome.storage.session.set({ [API_KEY_KEY]: apiKey });
}

export async function clearApiKey(): Promise<void> {
  await chrome.storage.session.remove(API_KEY_KEY);
}
