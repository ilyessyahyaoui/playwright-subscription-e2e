import { Page, expect } from '@playwright/test';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import { TeleAlertAdminPage } from '../../../pages/TeleAlertAdminPage';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function unsubContact(page: Page, t: Locale, lang: 'fr' | 'en') {
    const subAdmin = new SubscriptionAdminPage(page, t);
    const teleAlert = new TeleAlertAdminPage(page);
    const statusValidated = lang === 'fr' ? 'Validé' : 'Validated';

    await subAdmin.loginAndVerifyContact('test_auto', statusValidated);

    await page.getByRole('row', { name: 'test_auto test_auto' }).locator('i').click();
    await page.getByRole('link', { name: t.admin.unsubContact.viewEditLink }).click();
    await expect(page.getByRole('heading')).toContainText(`${t.admin.unsubContact.headingUser} ${process.env.Tel!}`, { timeout: 60_000 });

    await page.getByRole('button', { name: t.admin.unsubContact.unsubscribeButton }).click();
    await page.getByText(t.admin.unsubContact.confirmDialog).click();
    await page.getByRole('button', { name: t.admin.unsubContact.confirmNo }).click();
    await page.getByRole('button', { name: t.admin.unsubContact.unsubscribeButton }).click();
    await page.getByText(t.admin.unsubContact.confirmDialog).click();
    await page.getByRole('button', { name: t.admin.unsubContact.confirmYes }).click();

    await expect(page.getByRole('heading', { name: t.admin.unsubContact.unsubscribeHeading })).toBeVisible();
    await expect(page.locator('span')).toContainText(t.admin.unsubContact.unsubscribedText);

    await page.getByRole('button', { name: t.admin.unsubContact.returnHome }).click();
    await subAdmin.searchByPhone(process.env.Tel!);
    await expect(page.locator('thead')).toContainText(t.admin.unsubContact.headerLastName);
    await expect(page.locator('thead')).toContainText(t.admin.unsubContact.headerFirstName);
    await expect(page.getByRole('gridcell')).toContainText('No data available in table');
    await page.getByText('X', { exact: true }).click();

    await teleAlert.goto();
    await teleAlert.login();
    await teleAlert.navigateToSubscribers();
    await page.getByRole('textbox', { name: 'Rapid search' }).fill(process.env.Tel!);
    await page.getByRole('button').click();
    await expect(page.locator('#searchResult')).toContainText('Result of the research : 0 item (s) found');
    await page.locator('.glyphicon.glyphicon-remove').click();
}
