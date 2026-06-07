import { Page, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import fr from '../../../locales/fr.json';

type Locale = typeof fr;

export async function wrongCredentials(page: Page, t: Locale) {
    const loginPage = new LoginPage(page, t);

    await loginPage.goto();
    await loginPage.switchLanguage();
    await loginPage.verifyContent();

    await page.getByRole('textbox', { name: t.sub.login.phoneLabel }).click();
    const popover = page.locator('.popover-content').filter({ hasText: t.sub.login.popoverPhone });
    await expect(popover).toBeVisible();
    await expect(popover).toContainText(t.sub.login.popoverPhone);

    await page.getByRole('textbox', { name: t.sub.login.phoneLabel }).fill('a');
    await expect(page.getByText(t.sub.login.phoneError)).toBeVisible();

    await page.getByRole('textbox', { name: t.sub.login.passwordLabel }).click();
    await page.getByLabel(t.sub.login.passwordLabel).hover();

    if (t.sub.login.popoverPassword) {
        const popover1 = page.locator('.popover-content').filter({ hasText: t.sub.login.popoverPassword });
        await expect(popover1).toBeVisible();
        await expect(popover1).toContainText(t.sub.login.popoverPassword);
        await expect(popover1).toContainText(t.sub.login.forgotPassword);
    }

    await page.getByRole('textbox', { name: t.sub.login.passwordLabel }).fill('b');
    await page.getByRole('button', { name: t.sub.login.signInButton }).click();

    await expect(page.locator('form[name="formLogin"]')).toContainText(t.sub.login.formText);
    await expect(page.getByRole('alert')).toContainText(t.sub.login.alertInvalidCred);
}
