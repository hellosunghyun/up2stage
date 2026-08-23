import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  outputDir: "./output/playwright",
  workers: 1,
  timeout: 30_000,
  use: {
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
