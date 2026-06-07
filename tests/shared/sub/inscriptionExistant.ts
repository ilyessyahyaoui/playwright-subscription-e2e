import { Page, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { InscriptionPage } from '../../../pages/InscriptionPage';
import fr from '../../../locales/fr.json';
import * as dotenv from 'dotenv';
dotenv.config();

type Locale = typeof fr;

export async function inscriptionExistant(page: Page, t: Locale, lang: 'fr' | 'en') {
    const loginPage = new LoginPage(page, t);
    const inscriptionPage = new InscriptionPage(page, t);

    await loginPage.goto();
    await loginPage.switchLanguage();
    await loginPage.verifyContent();
    await loginPage.clickRegisterLink();
    await inscriptionPage.clickRegister();
    await inscriptionPage.fillPersonalInfo('test_auto', 'test_auto', lang);
    await inscriptionPage.selectPostalCode('13117');
    await inscriptionPage.fillAddress('aa');
    await inscriptionPage.confirmAddress();
    await inscriptionPage.fillPhone(process.env.Tel!);
    await inscriptionPage.fillPhone2(process.env.Tel!);
    await inscriptionPage.fillEmail(process.env.Email!);
    await inscriptionPage.fillSms(process.env.Tel!);
    await inscriptionPage.fillFaxAndVerifyError(process.env.Tel!);
    await inscriptionPage.fillPassword(process.env.Password!, process.env.Password!);
    await inscriptionPage.acceptConditions();
    await page.getByRole('button', { name: t.sub.inscription.createAccount }).click();

    await expect(page.locator('div').nth(5)).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(t.sub.inscription.existAlert);
}
