import { Page, expect } from '@playwright/test';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function searchNonExist(page: Page, t: Locale) {
    const adminPage = new SubscriptionAdminPage(page, t);

    await adminPage.goto();
    await adminPage.switchLanguage();
    await adminPage.verifyContent();
    await adminPage.login(process.env.Login!, process.env.Password!);

    await expect(page.getByRole('link', { name: t.admin.login.logo })).toBeVisible();
    await expect(page.locator('button')).toContainText(t.admin.search.logoutButton);
    await expect(page.locator('body')).toContainText(t.admin.search.searchTitle);
    await expect(page.locator('label')).toContainText(t.admin.search.fieldLabel);
    await expect(page.getByRole('contentinfo')).toContainText('Admin');
    await expect(page.getByRole('contentinfo')).toContainText(t.admin.login.footerLegal);
    await expect(page.getByRole('contentinfo')).toContainText(t.admin.login.footerFaq);
    await expect(page.getByRole('contentinfo')).toContainText(t.admin.login.footerCopyright);

    await adminPage.searchByPhone('0700000000');

    await expect(page.locator('#smsTable_length')).toContainText('Show 102550100 entries');
    await expect(page.locator('thead')).toContainText(t.admin.search.headerLastName);
    await expect(page.locator('thead')).toContainText(t.admin.search.headerFirstName);
    await expect(page.locator('thead')).toContainText(t.admin.search.headerEmail);
    await expect(page.locator('thead')).toContainText(t.admin.search.headerStatus);
    await expect(page.locator('thead')).toContainText(t.admin.search.headerActions);
    await expect(page.getByRole('gridcell')).toContainText('No data available in table');
    await expect(page.locator('#smsTable_info')).toContainText('Showing 0 to 0 of 0 entries');
    await expect(page.locator('#smsTable_previous')).toContainText('Previous');
    await expect(page.locator('#smsTable_next')).toContainText('Next');
    await page.getByText('X', { exact: true }).click();
}
