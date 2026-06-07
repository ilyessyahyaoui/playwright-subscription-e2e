import { Page, expect } from '@playwright/test';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function viewHistory(page: Page, t: Locale) {
    const subAdmin = new SubscriptionAdminPage(page, t);

    await subAdmin.goto();
    await subAdmin.switchLanguage();
    await subAdmin.verifyContent();
    await subAdmin.login(process.env.Login!, process.env.Password!);
    await subAdmin.searchByPhone(process.env.Tel!);

    await expect(page.locator('tbody')).toContainText('test_auto');
    await expect(page.locator('tbody')).toContainText(process.env.Email!);
    await expect(page.locator('tbody')).toContainText(t.admin.viewHistory.statusValidated);

    await page.getByRole('row', { name: 'test_auto test_auto' }).locator('i').click();
    await page.getByRole('link', { name: t.admin.viewHistory.viewHistoryLink }).click();

    await expect(page.locator('body')).toContainText(`${t.admin.viewHistory.historyHeading} ${process.env.Tel!}`, { timeout: 60_000 });
    await expect(page.locator('body')).toContainText(t.admin.viewHistory.backLink);
    await expect(page.locator('body')).toContainText(t.admin.viewHistory.viewEditLink);
    await expect(page.locator('body')).toContainText(t.admin.viewHistory.accountStats);
    await expect(page.locator('body')).toContainText(t.admin.viewHistory.accountStatus);
    await expect(page.locator('section')).toContainText(t.admin.viewHistory.historySection);
    await expect(page.locator('section')).toContainText(t.admin.viewHistory.event);
    await expect(page.locator('section')).toContainText(t.admin.viewHistory.eventDate);
    await expect(page.locator('section')).toContainText(t.admin.viewHistory.source);
    await expect(page.locator('section')).toContainText(t.admin.viewHistory.properties);
    await expect(page.locator('section')).toContainText(t.admin.viewHistory.accountCreated);
    await expect(page.locator('section')).toContainText(t.admin.viewHistory.userLabel);
    await expect(page.locator('section')).toContainText(t.admin.viewHistory.accountValidated);
}
