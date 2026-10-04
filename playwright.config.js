import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    locale: 'en-US',
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173/v2/',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
