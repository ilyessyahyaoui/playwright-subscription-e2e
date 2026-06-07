import { test, expect } from '../../fixtures/locale';
import { wrongCredentials } from '../../tests/shared/sub/wrongCredentials';
import { inscription } from '../../tests/shared/sub/inscription';
import { inscriptionExistant } from '../../tests/shared/sub/inscriptionExistant';
import { edit } from '../../tests/shared/sub/edit';
import { changePassword } from '../../tests/shared/sub/changePassword';
import { unsubscribe } from '../../tests/shared/sub/unsubscribe';

test.describe('Suite Sub', () => {
    test('Wrong credentials', async ({ page, t }) => {
        await wrongCredentials(page, t);
    });

    test('Inscription', async ({ page, t, lang }) => {
        await inscription(page, t, lang);
    });

    test('Inscription existing account', async ({ page, t, lang }) => {
        await inscriptionExistant(page, t, lang);
    });

    test('Edit', async ({ page, t, lang }) => {
        await edit(page, t, lang);
    });

    test('Change password', async ({ page, t }) => {
        await changePassword(page, t);
    });

    test('Unsubscribe', async ({ page, t }) => {
        await unsubscribe(page, t);
    });
});
