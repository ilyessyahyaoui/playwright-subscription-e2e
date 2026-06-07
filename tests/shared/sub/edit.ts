import { Page, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import { TeleAlertAdminPage } from '../../../pages/TeleAlertAdminPage';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function edit(page: Page, t: Locale, lang: 'fr' | 'en') {
    const loginPage = new LoginPage(page, t);
    const subAdmin = new SubscriptionAdminPage(page, t);
    const teleAlert = new TeleAlertAdminPage(page);

    await loginPage.goto();
    await loginPage.switchLanguage();
    await loginPage.verifyContent();
    await loginPage.loginWithDelay(process.env.Tel!, process.env.Password!);

    await expect(page.locator('.header > div')).toBeVisible();
    await expect(
        page.locator('span', { hasText: t.sub.nav.loggedInAs })
    ).toContainText(`${t.sub.nav.loggedInAs} ${process.env.Tel!}`, { timeout: 60_000 });

    await expect(page.getByRole('navigation')).toContainText(t.sub.nav.logout);
    await expect(page.getByRole('navigation')).toContainText(t.sub.nav.changePassword);
    await expect(page.getByRole('navigation')).toContainText(t.sub.nav.unsubscribe);
    await expect(page.getByRole('heading')).toContainText(t.sub.nav.headingYourData);
    await expect(page.getByRole('textbox', { name: t.sub.inscription.nameLabel })).toHaveValue('test_auto');
    await expect(page.getByRole('textbox', { name: t.sub.inscription.firstNameLabel })).toHaveValue('test_auto');
    await expect(page.getByRole('textbox', { name: t.sub.inscription.phone2Label })).toHaveValue(process.env.Tell!);
    await expect(page.getByRole('textbox', { name: t.sub.inscription.emailLabel })).toHaveValue(process.env.Email!);
    await expect(page.getByRole('textbox', { name: t.sub.inscription.smsLabel })).toHaveValue(process.env.Tell!);

    await page.getByRole('textbox', { name: t.sub.inscription.nameLabel }).fill('test_auto_edit');
    await page.getByRole('textbox', { name: t.sub.inscription.firstNameLabel }).fill('test_auto_edit');
    await page.getByRole('listbox', { name: t.sub.inscription.addressLabel }).fill('aab');
    await page.getByRole('button', { name: t.sub.edit.verifyAddress }).click();
    await expect(page.locator('#map_canvas')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    await page.getByRole('textbox', { name: t.sub.inscription.phone2Label }).fill('07 00 00 00 02');
    await page.getByRole('textbox', { name: t.sub.inscription.emailLabel }).fill('edit@g.com');
    await page.getByRole('textbox', { name: t.sub.inscription.smsLabel }).fill('07 00 00 00 01');
    await page.getByRole('button', { name: t.sub.edit.confirmButton }).click();

    await expect(page.getByRole('heading')).toContainText(t.sub.edit.successHeading);
    await expect(page.locator('span')).toContainText(t.sub.edit.savedText);
    await page.getByRole('button', { name: t.sub.edit.returnHome }).click();

    const statusValidated = lang === 'fr' ? 'Validé' : 'Validated';
    await subAdmin.loginAndVerifyContact('test_auto_edit', statusValidated);

    const context2 = await page.context().browser()!.newContext();
    const page2 = await context2.newPage();
    const loginPage2 = new LoginPage(page2, t);

    await loginPage2.goto();
    await loginPage2.switchLanguage();
    await loginPage2.verifyContent();
    await loginPage2.loginWithDelay(process.env.Tel!, process.env.Password!);

    await expect(page2.getByRole('textbox', { name: t.sub.inscription.nameLabel })).toHaveValue('test_auto_edit');
    await expect(page2.getByRole('textbox', { name: t.sub.inscription.firstNameLabel })).toHaveValue('test_auto_edit');
    await expect(page2.getByRole('textbox', { name: t.sub.inscription.phone2Label })).toHaveValue('07 00 00 00 02');
    await expect(page2.getByRole('textbox', { name: t.sub.inscription.emailLabel })).toHaveValue('edit@g.com');
    await expect(page2.getByRole('textbox', { name: t.sub.inscription.smsLabel })).toHaveValue('07 00 00 00 01');

    await page2.getByRole('textbox', { name: t.sub.inscription.nameLabel }).fill('test_auto');
    await page2.getByRole('textbox', { name: t.sub.inscription.firstNameLabel }).fill('test_auto');
    await page2.getByRole('listbox', { name: t.sub.inscription.addressLabel }).fill('aa');
    await page2.getByRole('button', { name: t.sub.edit.verifyAddress }).click();
    await expect(page2.locator('#map_canvas')).toBeVisible();
    await page2.getByRole('button', { name: 'OK' }).click();
    await page2.getByRole('textbox', { name: t.sub.inscription.phone2Label }).fill(process.env.Tel!);
    await page2.getByRole('textbox', { name: t.sub.inscription.emailLabel }).fill(process.env.Email!);
    await page2.getByRole('textbox', { name: t.sub.inscription.smsLabel }).fill(process.env.Tel!);
    await page2.getByRole('button', { name: t.sub.edit.confirmButton }).click();
    await expect(page2.getByRole('heading')).toContainText(t.sub.edit.successHeading);
    await expect(page2.locator('span')).toContainText(t.sub.edit.savedText);
    await page2.getByRole('button', { name: t.sub.edit.returnHome }).click();
    await context2.close();
}
