import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    testDir: './suites',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
    use: {
        baseURL: process.env.BASE_URL || 'https://your-app-url.com',
        actionTimeout: 60_000,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
    },
    timeout: 240_000,
    expect: {
        timeout: 60_000,
    },
    projects: [
        {
            name: 'FR',
            use: { ...devices['Desktop Chrome'], lang: 'fr' } as any,
            testMatch: '**/suites/shared/**/*.spec.ts',
        },
        {
            name: 'EN',
            use: { ...devices['Desktop Chrome'], lang: 'en' } as any,
            testMatch: '**/suites/shared/**/*.spec.ts',
        },
    ],
});
