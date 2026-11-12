import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'about-us.spec.ts',
  workers: 1,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3039', headless: true },
  projects: [
    { name: 'chrome', use: { browserName: 'chromium', channel: 'chrome' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  reporter: [['list']],
  outputDir: 'test-results/about-platforms',
});
