import { waitForEmailWithSubject } from '../gmail-utils';
import fr from '../locales/fr.json';

type Locale = typeof fr;

export async function verifyRegistrationEmail(t: Locale) {
    return waitForEmailWithSubject(t.email.registrationSubject);
}

export async function verifyValidationEmail(t: Locale) {
    return waitForEmailWithSubject(t.email.validationSubject);
}
