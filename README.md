# playwright-alert-subscription-e2e

E2E tests for a subscriber registration and alert system using Playwright and Gmail API.

---

## Description

End-to-end automated test suite for a web platform made of two interfaces:

- **Subscriber portal** — registration, login, edit profile, change password, unsubscribe
- **Admin portal** — search subscribers, validate/edit/unsubscribe contacts, resend validation email, view history

Key features:
- **Bilingual** — tests run in both French and English via a locale fixture
- **Page Object Model** — all interactions are encapsulated in page classes
- **Gmail API integration** — automatically retrieves validation emails sent after registration
- **CI/CD ready** — GitHub Actions workflow included

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── playwright.yml        # GitHub Actions CI pipeline
│
├── fixtures/
│   └── locale.ts                 # Bilingual fixture (fr/en)
│
├── functions/
│   └── verifyEmail.ts            # Gmail helpers (registration & validation email)
│
├── locales/
│   ├── en.json                   # English translations & selectors
│   └── fr.json                   # French translations & selectors
│
├── pages/
│   ├── InscriptionPage.ts        # Registration form interactions
│   ├── LoginPage.ts              # Subscriber login
│   ├── LoginPageAdmin.ts         # Admin login
│   ├── SubscriptionAdminPage.ts  # Admin subscriber management
│   └── TeleAlertAdminPage.ts     # TeleAlert admin panel
│
├── suites/
│   └── shared/
│       ├── sub.spec.ts           # Subscriber test suite
│       └── subAdmin.spec.ts      # Admin test suite
│
├── tests/
│   └── shared/
│       ├── sub/                  # Subscriber scenarios
│       │   ├── inscription.ts
│       │   ├── inscriptionExistant.ts
│       │   ├── edit.ts
│       │   ├── changePassword.ts
│       │   ├── unsubscribe.ts
│       │   └── wrongCredentials.ts
│       └── sub-admin/            # Admin scenarios
│           ├── validateContact.ts
│           ├── editContact.ts
│           ├── unsubContact.ts
│           ├── resendEmail.ts
│           ├── viewHistory.ts
│           ├── searchNonExist.ts
│           └── wrongCredentials.ts
│
├── gmail-utils.ts                # Gmail OAuth2 client & email parsing
├── gmail_admin.ts                # OAuth token generation (run once manually)
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── .gitignore
```

---

## Tech Stack

- [Playwright](https://playwright.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [Gmail API](https://developers.google.com/gmail/api)
- [GitHub Actions](https://github.com/features/actions)

---

## Installation

```bash
npm install
npx playwright install
```

---

## Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
Login=your-admin-login
Password=your-password
Password1=your-new-password
Tel=+33700000000
Tell=07 00 00 00 00
BASE_URL=https://your-app-url.com
Email=your-test-email@gmail.com
```

---

## Gmail API Setup

The project reads validation emails automatically using Gmail API OAuth2.

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Gmail API**
3. Create **OAuth 2.0 credentials** (Desktop app) and download as `credentials.json`
4. Run `gmail_admin.ts` once to generate `token.json`:
   ```bash
   npx ts-node gmail_admin.ts
   ```
5. Follow the URL printed in the terminal, authorize, paste the code back

The `credentials.json` and `token.json` files in this repo are **examples only** — replace them with your own.

---

## Running Tests

```bash
# Run all tests
npx playwright test

# UI mode
npx playwright test --ui

# Headed mode
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Subscriber suite only
npx playwright test suites/shared/sub.spec.ts

# Admin suite only
npx playwright test suites/shared/subAdmin.spec.ts
```

---

## Test Report

```bash
npx playwright show-report
```

---

## CI/CD — GitHub Actions

The pipeline runs on every push/PR to `main` or `master`.

Set the following **GitHub Secrets** in your repository settings:

| Secret | Description |
|---|---|
| `BASE_URL` | Application URL |
| `LOGIN` | Admin login |
| `PASSWORD` | Test account password |
| `PASSWORD1` | New password (used in change password test) |
| `TEL` | Primary phone number |
| `TELL` | Formatted phone number |
| `EMAIL` | Test Gmail address |

---

## Test Scenarios

### Subscriber (`sub.spec.ts`)
| Test | Description |
|---|---|
| Wrong credentials | Login with invalid credentials |
| Inscription | Full registration flow with email confirmation |
| Inscription existing account | Attempt to register an already validated account |
| Edit | Modify profile data and verify changes |
| Change password | Update password and verify login with new one |
| Unsubscribe | Delete account and verify removal |

### Admin (`subAdmin.spec.ts`)
| Test | Description |
|---|---|
| Wrong credentials admin | Login with invalid admin credentials |
| Search non existing contact | Search for a phone number with no results |
| Validate contact | Manually validate a subscriber from admin panel |
| Edit contact | Edit subscriber data from admin panel |
| Unsubscribe contact | Unsubscribe a user from admin panel |
| Resend validation email | Resend confirmation email and validate via link |
| View history | Check subscriber modification history |
