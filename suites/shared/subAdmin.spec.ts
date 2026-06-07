import { test, expect } from '../../fixtures/locale';
import { wrongCredentialsAdmin } from '../../tests/shared/sub-admin/wrongCredentials';
import { searchNonExist } from '../../tests/shared/sub-admin/searchNonExist';
import { validateContact } from '../../tests/shared/sub-admin/validateContact';
import { editContact } from '../../tests/shared/sub-admin/editContact';
import { unsubContact } from '../../tests/shared/sub-admin/unsubContact';
import { resendEmail } from '../../tests/shared/sub-admin/resendEmail';
import { viewHistory } from '../../tests/shared/sub-admin/viewHistory';

test.describe('Suite Sub-Admin', () => {
    test('Wrong credentials admin', async ({ page, t }) => {
        await wrongCredentialsAdmin(page, t);
    });

    test('Search non existing contact', async ({ page, t }) => {
        await searchNonExist(page, t);
    });

    test('Validate contact', async ({ page, t, lang }) => {
        await validateContact(page, t, lang);
    });

    test('Edit contact', async ({ page, t, lang }) => {
        await editContact(page, t, lang);
    });

    test('Unsubscribe contact', async ({ page, t, lang }) => {
        await unsubContact(page, t, lang);
    });

    test('Resend validation email', async ({ page, t, lang }) => {
        await resendEmail(page, t, lang);
    });

    test('View history', async ({ page, t }) => {
        await viewHistory(page, t);
    });
});
