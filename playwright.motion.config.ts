import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'site-motion.spec.ts',
  workers: 1,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3039', headless: true },
  projects: [
    {
      name: 'chrome-system-motion',
      grep: /real system preference|touch layout/,
      use: {
        browserName: 'chromium', channel: 'chrome', headless: false,
        video: { mode: 'on', size: { width: 1440, height: 730 } },
      },
    },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  reporter: [['list']],
  outputDir: 'test-results/motion-platforms',
});
