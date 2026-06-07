import { test as base } from '@playwright/test';
import fr from '../locales/fr.json';
import en from '../locales/en.json';

export type Lang = 'fr' | 'en';

const locales = { fr, en };

type LocaleFixture = {
    lang: Lang;
    t: typeof fr;
};

export const test = base.extend<LocaleFixture>({
    lang: ['fr', { option: true }],
    t: async ({ lang }, use) => {
        await use(locales[lang]);
    },
});

export { expect } from '@playwright/test';
