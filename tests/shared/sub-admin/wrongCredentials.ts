import { Page, expect } from '@playwright/test';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import fr from '../../../locales/fr.json';

type Locale = typeof fr;

export async function wrongCredentialsAdmin(page: Page, t: Locale) {
    const adminPage = new SubscriptionAdminPage(page, t);

    await adminPage.goto();
    await adminPage.switchLanguage();
    await adminPage.verifyContent();
    await adminPage.login('wrong_login', 'wrong_password');

    await expect(page.getByRole('alert')).toContainText(t.admin.login.alertInvalidCred);
}
