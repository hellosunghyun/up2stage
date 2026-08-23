import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  outputDir: "./output/playwright",
  timeout: 30_000,
  use: {
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
