import { Page, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { InscriptionPage } from '../../../pages/InscriptionPage';
import { SubscriptionAdminPage } from '../../../pages/SubscriptionAdminPage';
import { TeleAlertAdminPage } from '../../../pages/TeleAlertAdminPage';
import { verifyRegistrationEmail } from '../../../functions/verifyEmail';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

async function cleanupExistingSubscriber(page: Page, t: Locale) {
    const context = page.context();
    await context.clearCookies();

    const subAdmin = new SubscriptionAdminPage(page, t);
    await subAdmin.goto();
    await subAdmin.switchLanguage();
    await subAdmin.login(process.env.Login!, process.env.Password!);
    await subAdmin.searchByPhone(process.env.Tel!);

    const actionIcon = page.locator('tbody i').first();
    if (await actionIcon.count() === 0) {
        await context.clearCookies();
        return;
    }

    await actionIcon.click();
    await page.getByRole('link', { name: t.admin.editContact.viewEditLink }).click();
    await page.getByRole('button', { name: t.admin.editContact.unsubscribeButton }).click();
    await page.getByRole('button', { name: t.admin.editContact.confirmYes }).click();
    await expect(page.getByRole('heading', { name: t.admin.editContact.unsubscribeHeading })).toBeVisible({ timeout: 15_000 });
    await context.clearCookies();
}

export async function inscription(page: Page, t: Locale, lang: 'fr' | 'en') {
    await cleanupExistingSubscriber(page, t);
    const loginPage = new LoginPage(page, t);
    const inscriptionPage = new InscriptionPage(page, t);
    const subAdmin = new SubscriptionAdminPage(page, t);
    const teleAlert = new TeleAlertAdminPage(page);

    await loginPage.goto();
    await loginPage.switchLanguage();
    await loginPage.verifyContent();
    await loginPage.clickRegisterLink();

    await inscriptionPage.verifyLandingContent(lang);
    await inscriptionPage.clickRegister();
    await inscriptionPage.fillPersonalInfo('test_auto', 'test_auto', lang);
    await inscriptionPage.selectPostalCode('13117');
    await inscriptionPage.fillAddress('aa');
    await inscriptionPage.verifyHouseholdPopover();
    await inscriptionPage.confirmAddress();
    await inscriptionPage.fillPhone(process.env.Tell!);
    await inscriptionPage.fillPhone2(process.env.Tell!);
    await inscriptionPage.fillEmail(process.env.Email!);
    await inscriptionPage.fillSms(process.env.Tell!);
    await inscriptionPage.fillFaxAndVerifyError(process.env.Tel!);
    await inscriptionPage.fillPassword(process.env.Password!, process.env.Password!);
    await inscriptionPage.acceptConditions();
    await inscriptionPage.submit();

    const registrationEmail = await verifyRegistrationEmail(t);
    const link = registrationEmail.links[0];
    await page.goto(link);
    await loginPage.switchLanguage();

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
    await expect(page.getByRole('textbox', { name: t.sub.inscription.nameLabel })).toHaveValue('test_auto');
    await expect(page.getByRole('textbox', { name: t.sub.inscription.firstNameLabel })).toHaveValue('test_auto');

    // await teleAlert.loginAndVerifySubscriber('test_auto');

    const statusValidated = lang === 'fr' ? 'Validé' : 'Validated';
    await subAdmin.loginAndVerifyContact('test_auto', statusValidated);
}
