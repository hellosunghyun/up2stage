import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: [
      "src/**/*.test.{ts,tsx}",
      "test/unit/**/*.spec.{ts,tsx}",
      "test/integration/**/*.spec.{ts,tsx}",
    ],
  },
});
