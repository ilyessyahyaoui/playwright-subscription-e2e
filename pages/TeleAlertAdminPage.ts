import { Page, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export class TeleAlertAdminPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/auth/');
    }

    async login() {
        try {
            await expect(this.page.locator('header')).toBeVisible({ timeout: 5000 });
        } catch {
            await this.page.reload({ waitUntil: 'domcontentloaded' });
            await expect(this.page.locator('header')).toBeVisible({ timeout: 15000 });
        }

        await this.page.getByRole('textbox', { name: 'Login' }).fill(process.env.Login!);
        await this.page.getByRole('textbox', { name: 'Password' }).fill(process.env.Password!);
        await this.page.getByRole('button', { name: 'Sign in' }).click();

        try {
            await expect(this.page.getByRole('img', { name: 'Logo TéléAlerte' })).toBeVisible({ timeout: 5000 });
        } catch {
            await this.page.reload({ waitUntil: 'domcontentloaded' });
            await expect(this.page.locator('header')).toBeVisible({ timeout: 15000 });
        }

        await expect(this.page.getByLabel('Welcome to TeleAlert (version')).toContainText('Welcome to');
    }

    async navigateToSubscribers() {
        await this.page.getByRole('button', { name: 'Data management' }).click();
        await this.page.getByRole('link', { name: 'Subscribers Manage' }).click();
    }

    async searchByPhone(phone: string) {
        await this.page.getByRole('textbox', { name: 'Rapid search' }).fill(phone);
        await this.page.getByRole('button').click();
    }

    async verifySubscriberExists(expectedName: string) {
        await this.page.waitForSelector('#DataTables_Table_0 tbody tr');
        await expect(this.page.locator('#DataTables_Table_0')).toContainText(process.env.Tel!, { timeout: 90_000 });
        await expect(this.page.locator('#DataTables_Table_0')).toContainText(expectedName);
    }

    async loginAndVerifySubscriber(expectedName: string) {
        await this.goto();
        await this.login();
        await this.navigateToSubscribers();
        await this.searchByPhone(process.env.Tel!);
        await this.verifySubscriberExists(expectedName);
    }
}
