import { Page, expect } from '@playwright/test';
import fr from '../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export class InscriptionPage {
    constructor(private page: Page, private t: Locale) {}

    async verifyLandingContent(lang: 'fr' | 'en') {
        await expect(this.page.getByRole('group')).toContainText(this.t.sub.inscription.groupText1);
        await expect(this.page.getByRole('group')).toContainText(this.t.sub.inscription.groupText3);
        if (lang === 'fr') {
            await expect(this.page.getByRole('heading')).toContainText(this.t.sub.inscription.heading);
            await expect(this.page.getByRole('group')).toContainText(this.t.sub.inscription.groupText2);
            await expect(this.page.getByRole('group')).toContainText(this.t.sub.inscription.groupText4);
        }
    }

    async clickRegister() {
        await this.page.getByRole('button', { name: this.t.sub.inscription.registerButton }).click();
    }

    async fillPersonalInfo(name: string, firstName: string, lang: 'fr' | 'en') {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.nameLabel }).fill(name);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.firstNameLabel }).fill(firstName);
        if (lang === 'fr') {
            await this.page.selectOption('select', { value: 'string:M' });
        } else {
            await this.page.waitForTimeout(1000);
            await this.page.locator('#civility').selectOption('M');
        }
    }

    async selectPostalCode(code: string) {
        await this.page.getByLabel(this.t.sub.inscription.postalCodeLabel).selectOption(`string:${code}`);
    }

    async fillAddress(address: string) {
        await this.page.getByRole('listbox', { name: this.t.sub.inscription.addressLabel }).focus();
        const popoverAddress = this.page.locator('.popover-content').filter({ hasText: this.t.sub.inscription.popoverAddress });
        await expect(popoverAddress).toBeVisible();
        await expect(popoverAddress).toContainText(this.t.sub.inscription.popoverAddress);
        await this.page.getByRole('listbox', { name: this.t.sub.inscription.addressLabel }).fill(address);
        await expect(this.page.locator('span.general.ng-binding')).toContainText(this.t.sub.inscription.geoText);
    }

    async verifyHouseholdPopover() {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.householdLabel }).focus();
        const popover = this.page.locator('.popover-content').filter({ hasText: this.t.sub.inscription.popoverHousehold });
        await expect(popover).toBeVisible();
        await expect(popover).toContainText(this.t.sub.inscription.popoverHousehold);
    }

    async confirmAddress() {
        await this.page.getByRole('button', { name: this.t.sub.inscription.verifyAddress }).click();
        await expect(this.page.locator('#map_canvas')).toBeVisible();
        await this.page.getByRole('button', { name: 'OK' }).click();
    }

    async fillPhone(phone: string) {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.phoneLabel }).click();
        const popover = this.page.locator('.popover-content').filter({ hasText: this.t.sub.inscription.popoverPhone });
        await expect(popover).toBeVisible();
        await expect(popover).toContainText(this.t.sub.inscription.popoverPhone);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.phoneLabel }).fill(phone);
    }

    async fillPhone2(phone2: string) {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.phone2Label }).focus();
        const popover = this.page.locator('.popover-content:visible').filter({ hasText: this.t.sub.inscription.popoverPhone2 });
        await expect(popover).toHaveCount(1);
        await expect(popover).toBeVisible();
        await expect(popover).toContainText(this.t.sub.inscription.popoverPhone2);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.phone2Label }).fill(phone2);
    }

    async fillEmail(email: string) {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.emailLabel }).fill(email);
    }

    async fillSms(sms: string) {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.smsLabel }).focus();
        const popover = this.page.locator('.popover-content').filter({ hasText: this.t.sub.inscription.popoverSms });
        await expect(popover).toBeVisible();
        await expect(popover).toContainText(this.t.sub.inscription.popoverSms);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.smsLabel }).fill(sms);
    }

    async fillFaxAndVerifyError(fax: string) {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.faxLabel }).fill(fax);
        await expect(this.page.locator('form[name="formLogin"]')).toContainText(this.t.sub.inscription.faxError);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.faxLabel }).fill('');
    }

    async fillPassword(password: string, confirmPassword: string) {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.passwordLabel }).click();
        const popover = this.page.locator('.popover-content').filter({ hasText: this.t.sub.inscription.popoverPassword });
        await expect(popover).toContainText(this.t.sub.inscription.popoverPassword);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.passwordLabel }).fill(password);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.confirmPasswordLabel }).fill(confirmPassword);
    }

    async acceptConditions() {
        await this.page.getByRole('checkbox', { name: this.t.sub.inscription.cguCheckbox }).check();
        await this.page.getByRole('checkbox', { name: this.t.sub.inscription.rgpdCheckbox }).check();
    }

    async submit() {
        await this.page.getByRole('button', { name: this.t.sub.inscription.createAccount }).click();
        await this.page.waitForTimeout(5000);
        const errorAlert = this.page.getByRole('alert');
        if (await errorAlert.count() > 0) {
            const text = await errorAlert.textContent();
            if (text?.includes('invalides')) throw new Error(`Form validation failed: ${text.trim()}`);
        }
    }

    async quickRegister(lang: 'fr' | 'en') {
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.nameLabel }).fill('test_auto');
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.firstNameLabel }).fill('test_auto');
        await this.page.getByLabel(this.t.sub.inscription.civilityLabel).selectOption('string:MR');
        await this.page.getByLabel(this.t.sub.inscription.postalCodeLabel).selectOption('string:13117');
        await this.page.getByRole('listbox', { name: this.t.sub.inscription.addressLabel }).fill('aa');
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.phoneLabel }).fill(process.env.Tel!);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.phone2Label }).fill(process.env.Tel!);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.emailLabel }).fill(process.env.Email!);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.smsLabel }).fill(process.env.Tel!);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.passwordLabel }).fill(process.env.Password!);
        await this.page.getByRole('textbox', { name: this.t.sub.inscription.confirmPasswordLabel }).fill(process.env.Password!);
        await this.page.getByRole('checkbox', { name: this.t.sub.inscription.cguCheckbox }).check();
        await this.page.getByRole('checkbox', { name: this.t.sub.inscription.rgpdCheckbox }).check();
        await this.page.getByRole('button', { name: this.t.sub.inscription.createAccount }).click();
        await this.page.waitForTimeout(3000);
    }

    static async verifySubscriberData(page: Page, t: Locale, data: {
        name: string;
        civility: string;
        postalCode: string;
        address: string;
        phone2: string;
        email: string;
        sms: string;
    }) {
        const context2 = await page.context().browser()!.newContext();
        const page2 = await context2.newPage();

        await page2.goto(t.sub.login.url);
        try {
            const count = await page2.locator(t.langActiveClass).count();
            if (count > 0) await page2.getByRole('link', { name: t.langLink }).click();
        } catch {}

        await page2.getByRole('textbox', { name: t.sub.login.phoneLabel }).pressSequentially(process.env.Tel!, { delay: 50 });
        await page2.getByRole('textbox', { name: t.sub.login.passwordLabel }).fill(process.env.Password!);
        await page2.getByRole('button', { name: t.sub.login.signInButton }).click();

        await expect(page2.getByRole('navigation')).toContainText(t.sub.nav.logout);
        await expect(page2.getByRole('heading')).toContainText(t.sub.nav.headingYourData);
        await expect(page2.getByRole('textbox', { name: t.sub.inscription.nameLabel })).toHaveValue(data.name);
        await expect(page2.getByRole('textbox', { name: t.sub.inscription.firstNameLabel })).toHaveValue(data.name);
        await expect(page2.getByLabel(t.sub.inscription.civilityLabel)).toHaveValue(data.civility);
        await expect(page2.getByLabel(t.sub.inscription.postalCodeLabel)).toHaveValue(data.postalCode);
        await expect(page2.getByRole('textbox', { name: t.sub.inscription.cityLabel })).toHaveValue('Martigues');
        await expect(page2.getByRole('listbox', { name: t.sub.inscription.addressLabel })).toHaveValue(data.address);
        await expect(page2.getByRole('textbox', { name: t.sub.inscription.phoneLabel })).toHaveValue(process.env.Tell!);
        await expect(page2.getByRole('textbox', { name: t.sub.inscription.phone2Label })).toHaveValue(data.phone2);
        await expect(page2.getByRole('textbox', { name: t.sub.inscription.emailLabel })).toHaveValue(data.email);
        await expect(page2.getByRole('textbox', { name: t.sub.inscription.smsLabel })).toHaveValue(data.sms);

        await context2.close();
    }
}
