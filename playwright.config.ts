import { defineConfig, devices } from '@playwright/test';

// Exercise the built bundle under the same subdirectory used by GitHub Pages.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:4173/deep-learning-atlas/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
    locale: 'zh-CN',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } }],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort --base=/deep-learning-atlas/',
    url: 'http://127.0.0.1:4173/deep-learning-atlas/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
