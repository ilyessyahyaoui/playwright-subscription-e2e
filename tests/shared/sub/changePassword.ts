import { Page, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function changePassword(page: Page, t: Locale) {
    const loginPage = new LoginPage(page, t);

    await loginPage.goto();
    await loginPage.switchLanguage();
    await loginPage.verifyContent();
    await loginPage.loginWithDelay(process.env.Tel!, process.env.Password!);

    await expect(page.locator('.header > div')).toBeVisible();
    await expect(
        page.locator('span', { hasText: t.sub.nav.loggedInAs })
    ).toContainText(`${t.sub.nav.loggedInAs} ${process.env.Tel!}`, { timeout: 60_000 });

    await page.getByRole('button', { name: t.sub.changePassword.button }).click();
    await expect(page.getByRole('link', { name: t.sub.changePassword.logo })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText(t.sub.changePassword.heading);
    await expect(page.locator('#formPassword')).toContainText(t.sub.changePassword.currentPwd);
    await expect(page.locator('#formPassword')).toContainText(t.sub.changePassword.newPwd);
    await expect(page.locator('#formPassword')).toContainText(t.sub.changePassword.required);
    await expect(page.locator('#formPassword')).toContainText(t.sub.changePassword.confirmPwd);

    await page.getByRole('textbox', { name: t.sub.changePassword.newPwd }).fill('aa');
    await expect(page.locator('#formPassword')).toContainText(t.sub.changePassword.pwdRules);

    await page.getByRole('button', { name: t.sub.changePassword.cancelButton }).click();
    await expect(page.getByRole('heading')).toContainText(t.sub.nav.headingYourData);
    await page.getByRole('button', { name: t.sub.changePassword.button }).click();
    await expect(page.locator('#formPassword')).toContainText(t.sub.changePassword.currentPwd);

    await page.getByRole('textbox', { name: t.sub.changePassword.currentPwd }).fill(process.env.Password!);
    await page.getByRole('textbox', { name: t.sub.changePassword.newPwd }).fill(process.env.Password1!);
    await page.getByRole('textbox', { name: t.sub.changePassword.confirmPwd }).fill(process.env.Password1!);
    await page.getByRole('button', { name: t.sub.changePassword.changeButton }).click();

    await expect(page.locator('h2')).toContainText(t.sub.changePassword.successMsg);
    await page.getByRole('button', { name: t.sub.changePassword.returnForm }).click();
    await page.getByRole('button', { name: t.sub.changePassword.logoutButton }).click();
    await expect(page.getByRole('heading')).toContainText(t.sub.changePassword.logoutHeading);
    await expect(page.locator('span')).toContainText(t.sub.changePassword.logoutText);
    await page.getByRole('button', { name: t.sub.changePassword.returnHome }).click();

    await loginPage.loginWithDelay(process.env.Tel!, process.env.Password1!);
    await expect(page.getByRole('heading')).toContainText(t.sub.nav.headingYourData);
    await expect(page.locator('form[name="formRegister"]')).toContainText(t.sub.changePassword.formSection);
}
