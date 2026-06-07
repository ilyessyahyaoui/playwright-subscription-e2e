import { Page, expect } from '@playwright/test';
import fr from '../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export class SubscriptionAdminPage {
    constructor(private page: Page, private t: Locale) {}

    async goto() {
        await this.page.goto(this.t.admin.login.url);
    }

    async switchLanguage() {
        try {
            const count = await this.page.locator(this.t.langActiveClass).count();
            if (count > 0) await this.page.getByRole('link', { name: this.t.langLink }).click();
        } catch (error) {
            console.error('Erreur lors du changement de langue:', error);
        }
    }

    async verifyContent() {
        await expect(this.page.getByRole('link', { name: this.t.admin.login.logo })).toBeVisible();
        await expect(this.page.locator('body')).toContainText(this.t.admin.login.interfaceTitle);
        await expect(this.page.locator('form')).toContainText(this.t.admin.login.passwordLabel);
        await expect(this.page.getByRole('button')).toContainText(this.t.admin.login.signInButton);
        await expect(this.page.getByRole('contentinfo')).toContainText(this.t.admin.login.footerLegal);
        await expect(this.page.getByRole('contentinfo')).toContainText(this.t.admin.login.footerFaq);
        await expect(this.page.getByRole('contentinfo')).toContainText(this.t.admin.login.footerCopyright);
    }

    async login(username: string, password: string) {
        await this.page.getByRole('textbox', { name: this.t.admin.login.loginLabel }).pressSequentially(username, { delay: 50 });
        await this.page.getByRole('textbox', { name: this.t.admin.login.passwordLabel }).fill(password);
        await this.page.getByRole('button', { name: this.t.admin.login.signInButton }).click();
    }

    async searchByPhone(phone: string) {
        await this.page.getByRole('textbox', { name: this.t.admin.search.searchLabel }).fill(phone);
        await this.page.getByRole('button', { name: this.t.admin.search.addButton }).click();
        await this.page.getByRole('button', { name: this.t.admin.search.searchButton }).click();
    }

    async verifyContactInResults(name: string, status: string) {
        await expect(this.page.locator('tbody')).toContainText(name);
        await expect(this.page.locator('tbody')).toContainText(process.env.Email!);
        const firstRow = this.page.locator('tbody tr').nth(0);
        await expect(firstRow.locator('td').nth(3)).toContainText(status);
    }

    async loginAndVerifyContact(name: string, status: string) {
        await this.goto();
        await this.switchLanguage();
        await this.verifyContent();
        await this.login(process.env.Login!, process.env.Password!);
        await this.searchByPhone(process.env.Tel!);
        await this.verifyContactInResults(name, status);
    }
}
