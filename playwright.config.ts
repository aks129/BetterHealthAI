import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5000,
    timeout: 30000,
    reuseExistingServer: true,
  },
});
