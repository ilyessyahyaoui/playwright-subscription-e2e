import { Page, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { TeleAlertAdminPage } from '../../../pages/TeleAlertAdminPage';
import { LoginPageAdmin } from '../../../pages/LoginPageAdmin';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function unsubscribe(page: Page, t: Locale) {
    const loginPage = new LoginPage(page, t);
    const teleAlert = new TeleAlertAdminPage(page);
    const adminPage = new LoginPageAdmin(page, t);

    await loginPage.goto();
    await loginPage.switchLanguage();
    await loginPage.verifyContent();
    await loginPage.loginWithDelay(process.env.Tel!, process.env.Password1!);

    await expect(page.locator('.header > div')).toBeVisible();
    await expect(
        page.locator('span', { hasText: t.sub.nav.loggedInAs })
    ).toContainText(`${t.sub.nav.loggedInAs} ${process.env.Tel!}`, { timeout: 60_000 });

    await page.getByRole('button', { name: t.sub.unsubscribe.button }).click();
    await expect(page.getByRole('dialog')).toContainText(t.sub.unsubscribe.dialog);
    await page.getByRole('button', { name: t.sub.unsubscribe.confirmNo }).click();
    await page.getByRole('button', { name: t.sub.unsubscribe.button }).click();
    await page.getByRole('button', { name: t.sub.unsubscribe.confirmYes }).click();

    await expect(page.getByText(t.sub.unsubscribe.successText)).toBeVisible();
    await page.getByRole('button', { name: t.sub.unsubscribe.returnHome }).click();

    await page.getByRole('textbox', { name: t.sub.login.phoneLabel }).fill(process.env.Tel!);
    await page.getByRole('textbox', { name: t.sub.login.passwordLabel }).fill(process.env.Password1!);
    await page.getByRole('button', { name: t.sub.login.signInButton }).click();
    await expect(page.getByRole('alert')).toContainText(t.sub.unsubscribe.alertInvalidCred);

    await teleAlert.goto();
    await teleAlert.login();
    await teleAlert.navigateToSubscribers();
    await page.getByRole('textbox', { name: 'Rapid search' }).fill(process.env.Tel!);
    await page.getByRole('button').click();
    await expect(page.locator('#searchResult')).toContainText('Result of the research : 0 item (s) found');
    await page.locator('.glyphicon.glyphicon-remove').click();

    await adminPage.goto();
    await adminPage.switchLanguage();
    await adminPage.login(process.env.Login!, process.env.Password!);
    await page.getByRole('textbox', { name: t.admin.search.searchLabel }).fill(process.env.Tel!);
    await page.getByRole('button', { name: t.admin.search.addButton }).click();
    await page.getByRole('button', { name: t.admin.search.searchButton }).click();
    await expect(page.getByRole('gridcell')).toContainText('No data available in table');
    await page.getByText('X', { exact: true }).click();
}
