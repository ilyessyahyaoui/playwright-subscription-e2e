import { Page, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { InscriptionPage } from '../../../pages/InscriptionPage';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import { TeleAlertAdminPage } from '../../../pages/TeleAlertAdminPage';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function validateContact(page: Page, t: Locale, lang: 'fr' | 'en') {
    const context = page.context();
    await context.clearCookies();

    const loginPage = new LoginPage(page, t);
    const inscriptionPage = new InscriptionPage(page, t);
    const subAdmin = new SubscriptionAdminPage(page, t);
    const teleAlert = new TeleAlertAdminPage(page);

    await loginPage.goto();
    await loginPage.switchLanguage();
    await loginPage.clickRegisterLink();
    await inscriptionPage.clickRegister();
    await inscriptionPage.quickRegister(lang);

    const statusCreated = lang === 'fr' ? 'Créé' : 'Created';
    await subAdmin.loginAndVerifyContact('test_auto', statusCreated);

    await expect(page.locator('#smsTable_previous')).toContainText('Previous');
    await expect(page.locator('#smsTable_next')).toContainText('Next');

    await page.locator('i.glyphicon.glyphicon-plus').click();
    await page.getByRole('link', { name: t.admin.validateContact.validateLink }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: t.admin.validateContact.searchButton }).click();

    const firstRow = page.locator('tbody tr').nth(0);
    await expect(firstRow.locator('td').nth(3)).toContainText(statusCreated);

    await InscriptionPage.verifySubscriberData(page, t, {
        name: 'test_auto',
        civility: 'string:MR',
        postalCode: 'string:13117',
        address: 'aa',
        phone2: process.env.Tell!,
        email: process.env.Email!,
        sms: process.env.Tell!,
    });

    await teleAlert.loginAndVerifySubscriber('test_auto');
}
