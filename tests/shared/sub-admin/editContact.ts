import { Page, expect } from '@playwright/test';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import { InscriptionPage } from '../../../pages/InscriptionPage';
import { TeleAlertAdminPage } from '../../../pages/TeleAlertAdminPage';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function editContact(page: Page, t: Locale, lang: 'fr' | 'en') {
    const subAdmin = new SubscriptionAdminPage(page, t);
    const teleAlert = new TeleAlertAdminPage(page);
    const statusValidated = lang === 'fr' ? 'Validé' : 'Validated';

    await subAdmin.loginAndVerifyContact('test_auto', statusValidated);

    await page.getByRole('row', { name: 'test_auto test_auto' }).locator('i').click();
    await page.getByRole('link', { name: t.admin.editContact.viewEditLink }).click();

    await expect(page.locator('.header > div')).toBeVisible();
    await expect(page.getByRole('navigation')).toContainText(t.admin.editContact.navLogout);
    await expect(page.getByRole('navigation')).toContainText(t.admin.editContact.navReturnHome);
    await expect(page.getByRole('navigation')).toContainText(t.admin.editContact.navViewHistory);
    await expect(page.getByRole('navigation')).toContainText(t.admin.editContact.navUnsubscribe);
    await expect(page.getByText('X', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText(`${t.admin.editContact.headingUser} ${process.env.Tel!}`, { timeout: 60_000 });
    await expect(page.getByRole('textbox', { name: t.admin.editContact.nameLabel })).toHaveValue('test_auto');
    await expect(page.getByRole('textbox', { name: t.admin.editContact.firstNameLabel })).toHaveValue('test_auto');
    await expect(page.locator('form[name="formRegister"]')).toContainText(t.admin.editContact.faxLabel);
    await expect(page.locator('form[name="formRegister"]')).toContainText(t.admin.editContact.vacationer);
    await expect(page.locator('form[name="formRegister"]')).toContainText(t.admin.editContact.vacationerText);

    await page.getByRole('textbox', { name: t.admin.editContact.nameLabel }).fill('test_auto_edit');
    await page.getByRole('textbox', { name: t.admin.editContact.firstNameLabel }).fill('test_auto_edit');
    await page.getByRole('textbox', { name: t.admin.editContact.phone2Label }).fill('07 00 00 00 02');
    await page.getByRole('textbox', { name: t.admin.editContact.emailLabel }).fill('edit@g.com');
    await page.getByRole('textbox', { name: t.admin.editContact.smsLabel }).fill('07 00 00 00 01');
    await page.getByRole('button', { name: t.admin.editContact.confirmButton }).click();

    await expect(page.getByRole('alert')).toContainText(t.admin.editContact.successAlert);
    await expect(page.getByRole('textbox', { name: t.admin.editContact.nameLabel })).toHaveValue('test_auto_edit');

    await teleAlert.loginAndVerifySubscriber('test_auto_edit');

    await InscriptionPage.verifySubscriberData(page, t, {
        name: 'test_auto_edit',
        civility: 'string:MME',
        postalCode: 'string:13500',
        address: 'aab',
        phone2: '07 00 00 00 02',
        email: 'edit@g.com',
        sms: '07 00 00 00 01',
    });

    await subAdmin.loginAndVerifyContact('test_auto_edit', statusValidated);
    await page.getByRole('row', { name: 'test_auto_edit test_auto_edit' }).locator('i').click();
    await page.getByRole('link', { name: t.admin.editContact.viewEditLink }).click();
    await expect(page.getByRole('heading')).toContainText(`${t.admin.editContact.headingUser} ${process.env.Tel!}`, { timeout: 60_000 });
    await page.getByRole('button', { name: t.admin.editContact.unsubscribeButton }).click();
    await page.getByText(t.admin.editContact.confirmDialog).click();
    await page.getByRole('button', { name: t.admin.editContact.confirmYes }).click();
    await expect(page.getByRole('heading', { name: t.admin.editContact.unsubscribeHeading })).toBeVisible();
    await expect(page.locator('span')).toContainText(t.admin.editContact.unsubscribedText);
}
