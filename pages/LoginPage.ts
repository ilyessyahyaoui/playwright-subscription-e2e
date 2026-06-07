import { Page, expect } from '@playwright/test';
import fr from '../locales/fr.json';

type Locale = typeof fr;

export class LoginPage {
    constructor(private page: Page, private t: Locale) {}

    async goto() {
        await this.page.goto(this.t.sub.login.url);
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
        await expect(this.page.locator('div').nth(5)).toBeVisible();
        await expect(this.page.getByRole('form')).toContainText(this.t.sub.login.formText);
        await expect(this.page.getByRole('form')).toContainText(this.t.sub.login.passwordLabel);
        await expect(this.page.getByRole('form')).toContainText(this.t.sub.login.forgotPassword);
        await expect(this.page.getByRole('contentinfo')).toContainText(this.t.sub.login.footerLegal);
        await expect(this.page.getByRole('contentinfo')).toContainText(this.t.sub.login.footerFaq);
        await expect(this.page.getByRole('contentinfo')).toContainText(this.t.sub.login.footerCopyright);
    }

    async login(phone: string, password: string) {
        await this.page.getByRole('textbox', { name: this.t.sub.login.phoneLabel }).fill(phone);
        await this.page.getByRole('textbox', { name: this.t.sub.login.passwordLabel }).fill(password);
        await this.page.getByRole('button', { name: this.t.sub.login.signInButton }).click();
    }

    async loginWithDelay(phone: string, password: string) {
        await this.page.getByRole('textbox', { name: this.t.sub.login.phoneLabel }).pressSequentially(phone, { delay: 50 });
        await this.page.getByRole('textbox', { name: this.t.sub.login.passwordLabel }).fill(password);
        await this.page.getByRole('button', { name: this.t.sub.login.signInButton }).click();
    }

    async clickRegisterLink() {
        await this.page.getByRole('link', { name: this.t.sub.login.registerLink, exact: true }).click();
    }
}
