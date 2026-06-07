import { Page, expect } from '@playwright/test';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import { TeleAlertAdminPage } from '../../../pages/TeleAlertAdminPage';
import { InscriptionPage } from '../../../pages/InscriptionPage';
import { verifyValidationEmail } from '../../../functions/verifyEmail';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function resendEmail(page: Page, t: Locale, lang: 'fr' | 'en') {
    const context = page.context();
    await context.clearCookies();

    const subAdmin = new SubscriptionAdminPage(page, t);
    const teleAlert = new TeleAlertAdminPage(page);
    const statusCreated = lang === 'fr' ? 'Crée' : 'Created';
    const statusValidated = lang === 'fr' ? 'Validé' : 'Validated';

    await subAdmin.loginAndVerifyContact('test_auto', statusCreated);

    await expect(page.locator('#smsTable_previous')).toContainText('Previous');
    await expect(page.locator('#smsTable_next')).toContainText('Next');

    await page.locator('i.glyphicon.glyphicon-plus').click();
    await page.getByRole('link', { name: t.admin.resendEmail.resendLink }).click();
    await expect(page.getByRole('alert')).toContainText(t.admin.resendEmail.alertSent);
    await page.waitForTimeout(3000);

    const validationEmail = await verifyValidationEmail(t);
    const link = validationEmail.links[0];
    await page.goto(link);

    try {
        const count = await page.locator(t.langActiveClass).count();
        if (count > 0) await page.getByRole('link', { name: t.langLink }).click();
    } catch (error) {
        console.error('Erreur lors du changement de langue:', error);
    }

    await expect(page.getByRole('link', { name: t.sub.emailConfirmation.logo })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText(t.sub.emailConfirmation.heading);
    await expect(page.locator('span')).toContainText(t.sub.emailConfirmation.text);
    await expect(page.getByRole('button')).toContainText(t.sub.emailConfirmation.button);
    await expect(page.getByRole('contentinfo')).toContainText(t.sub.emailConfirmation.footerLegal);
    await expect(page.getByRole('contentinfo')).toContainText(t.sub.emailConfirmation.footerFaq);
    await expect(page.getByRole('contentinfo')).toContainText(t.sub.emailConfirmation.footerCopyright);
    await page.getByRole('button', { name: t.sub.emailConfirmation.button }).click();

    await expect(page.getByRole('alert')).toContainText(t.sub.emailConfirmation.successAlert);
    await expect(page.getByRole('navigation')).toContainText(t.sub.nav.logout);
    await expect(page.getByRole('navigation')).toContainText(t.sub.nav.changePassword);
    await expect(page.getByRole('navigation')).toContainText(t.sub.nav.unsubscribe);
    await expect(page.getByRole('heading')).toContainText(t.sub.nav.headingYourData);

    await context.clearCookies();
    await teleAlert.loginAndVerifySubscriber('test_auto');

    await InscriptionPage.verifySubscriberData(page, t, {
        name: 'test_auto',
        civility: 'string:MR',
        postalCode: 'string:13117',
        address: 'aa',
        phone2: process.env.Tell!,
        email: process.env.Email!,
        sms: process.env.Tell!,
    });

    await subAdmin.loginAndVerifyContact('test_auto', statusValidated);
    await page.getByRole('row', { name: 'test_auto test_auto' }).locator('i').click();
    await page.getByRole('link', { name: t.admin.resendEmail.viewEditLink }).click();
    await expect(page.getByRole('heading')).toContainText(`${t.admin.resendEmail.headingUser} ${process.env.Tel!}`, { timeout: 60_000 });
    await page.getByRole('button', { name: t.admin.resendEmail.unsubscribeButton }).click();
    await page.getByRole('button', { name: t.admin.editContact.confirmYes }).click();
    await expect(page.getByRole('heading', { name: t.admin.resendEmail.unsubscribeHeading })).toBeVisible();
}
