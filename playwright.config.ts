import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3039', channel: 'chrome', headless: true },
  reporter: [['list']],
  outputDir: 'test-results',
});
