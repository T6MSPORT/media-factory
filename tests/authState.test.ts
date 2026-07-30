import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const {
  applyCloudAccount,
  clearCloudSession,
  markEmailConfirmationPending,
  validateRegistration,
} = await server.ssrLoadModule('/src/state/authState.ts');
const { ConfirmationForm, RegistrationForm } = await server.ssrLoadModule('/src/pages/AuthPage.tsx');
const { readableAuthError } = await server.ssrLoadModule('/src/services/cloudAuth.ts');
const { normaliseData, starter } = await server.ssrLoadModule('/src/store.ts');

after(() => server.close());

const account = {
  id: 'driver-account-46',
  email: 'rich@example.com',
  driverName: 'Rich Weatherill',
  createdAt: '2026-07-30T12:00:00.000Z',
};

test('a cloud account locks the canonical driver name', () => {
  const authenticated = applyCloudAccount(
    {
      ...starter,
      profile: { ...starter.profile, name: 'Tampered Driver', number: '46' },
    },
    account,
  );

  assert.equal(authenticated.authentication.signedIn, true);
  assert.equal(authenticated.authentication.account.id, 'driver-account-46');
  assert.equal(authenticated.authentication.account.email, 'rich@example.com');
  assert.equal(authenticated.profile.name, 'Rich Weatherill');
  assert.equal(authenticated.profile.number, '46');
  assert.equal(authenticated.profile.nameLocked, true);
  assert.equal(authenticated.onboardingComplete, true);
});

test('sign out clears only the cloud session and retains local work', () => {
  const authenticated = applyCloudAccount(starter, account);
  const signedOut = clearCloudSession({
    ...authenticated,
    projects: [{ id: 'saved-graphic' }],
  });

  assert.equal(signedOut.authentication.signedIn, false);
  assert.equal(signedOut.authentication.account.id, account.id);
  assert.equal(signedOut.projects[0].id, 'saved-graphic');
});

test('email confirmation keeps the new cloud account signed out', () => {
  const pending = markEmailConfirmationPending(starter, account);
  assert.equal(pending.authentication.signedIn, false);
  assert.equal(pending.authentication.pendingEmailConfirmation, true);
  assert.equal(pending.authentication.lastEmail, 'rich@example.com');
});

test('pending registration clearly blocks login and supports resending confirmation', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ConfirmationForm, {
      email: 'rich@example.com',
      resendConfirmation: async () => {},
      showLogin: () => {},
    }),
  );

  assert.match(markup, /won’t be able to sign in until the email is confirmed/);
  assert.match(markup, /Resend confirmation email/);
  assert.match(markup, /I’ve confirmed my email/);
});

test('cloud auth reports email delivery and rate-limit failures clearly', () => {
  assert.equal(
    readableAuthError('Error sending confirmation email').message,
    'The account email could not be sent. Check the Media Factory email service and try again.',
  );
  assert.equal(
    readableAuthError('Email rate limit exceeded', 'over_email_send_rate_limit').message,
    'Too many account emails have been requested. Wait a few minutes and try again.',
  );
  assert.equal(
    readableAuthError('Database error saving new user', 'unexpected_failure').message,
    'Account service error: Database error saving new user (unexpected_failure)',
  );
});

test('registration rejects incomplete identity and weak account details', () => {
  assert.throws(
    () => validateRegistration('not-an-email', 'correct-horse', 'Rich Weatherill'),
    /valid email/,
  );
  assert.throws(
    () => validateRegistration('rich@example.com', 'short', 'Rich Weatherill'),
    /at least 8 characters/,
  );
  assert.throws(
    () => validateRegistration('rich@example.com', 'correct-horse', ''),
    /Driver name is required/,
  );
});

test('registration only asks for the driver name beyond login credentials', () => {
  const markup = renderToStaticMarkup(
    React.createElement(RegistrationForm, {
      data: starter,
      register: async () => {},
    }),
  );

  assert.match(markup, /Driver name/);
  assert.match(markup, /Email address/);
  assert.doesNotMatch(markup, /Car number/);
  assert.doesNotMatch(markup, /Team name/);
  assert.doesNotMatch(markup, /Upload driver image/);
  assert.doesNotMatch(markup, /Upload team logo/);
});

test('saved cloud accounts normalise safely and never restore a local session', () => {
  const restored = normaliseData({
    ...starter,
    profile: { ...starter.profile, name: 'Tampered Driver' },
    authentication: {
      account,
      signedIn: true,
    },
  });

  assert.equal(restored.authentication.account.email, 'rich@example.com');
  assert.equal(restored.authentication.signedIn, false);
  assert.equal(restored.profile.name, 'Rich Weatherill');
  assert.equal(restored.profile.nameLocked, true);
});

test('legacy browser credentials are discarded but pre-fill migration details', () => {
  const restored = normaliseData({
    ...starter,
    profile: { ...starter.profile, name: 'Rich Weatherill' },
    authentication: {
      account: {
        email: 'RICH@example.com',
        driverName: 'Rich Weatherill',
        passwordHash: 'browser-hash',
        passwordSalt: 'browser-salt',
        createdAt: '2026-07-29T12:00:00.000Z',
      },
      signedIn: true,
    },
  });

  assert.equal(restored.authentication.account, undefined);
  assert.equal(restored.authentication.lastEmail, 'rich@example.com');
  assert.equal(restored.authentication.signedIn, false);
  assert.equal(restored.profile.name, 'Rich Weatherill');
});
