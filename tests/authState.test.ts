import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  hasWorkspaceContent,
  markEmailConfirmationPending,
  signedOutData,
  validateRegistration,
} = await server.ssrLoadModule('/src/state/authState.ts');
const { AuthPage, ConfirmationForm, InviteActivationForm, RegistrationForm, WorkspaceMigration } = await server.ssrLoadModule('/src/pages/AuthPage.tsx');
const { authLinkFromSearch, normaliseInvitationCode, readableAuthError } = await server.ssrLoadModule('/src/services/cloudAuth.ts');
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

test('sign out removes the previous account workspace from application memory', () => {
  const signedOut = signedOutData('rich@example.com');
  assert.equal(signedOut.authentication.signedIn, false);
  assert.equal(signedOut.authentication.account, undefined);
  assert.equal(signedOut.authentication.lastEmail, 'rich@example.com');
  assert.deepEqual(signedOut.projects, []);
  assert.equal(signedOut.profile.driverImage, undefined);
});

test('workspace migration is offered explicitly instead of sharing legacy work', () => {
  const legacy = {
    ...starter,
    onboardingComplete: true,
    projects: [{ id: 'saved-graphic' }],
  };
  assert.equal(hasWorkspaceContent(legacy), true);
  assert.equal(hasWorkspaceContent(starter), false);

  const markup = renderToStaticMarkup(
    React.createElement(WorkspaceMigration, {
      email: 'new-driver@example.com',
      importExisting: async () => {},
      startFresh: async () => {},
    }),
  );
  assert.match(markup, /Move existing work to this account/);
  assert.match(markup, /Start with a clean workspace/);
  assert.match(markup, /never shared automatically/);
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
  assert.equal(
    readableAuthError('{}', 'unexpected_failure', 'recovery').message,
    'The password reset email could not be sent. Check the Media Factory email service and try again.',
  );
});

test('auth callbacks accept invite and recovery token hashes only', () => {
  assert.equal(authLinkFromSearch('?token_hash=invite-token&type=invite'), 'invite');
  assert.equal(authLinkFromSearch('?token_hash=recovery-token&type=recovery'), 'recovery');
  assert.equal(authLinkFromSearch('?invite=invite-token'), 'invite');
  assert.equal(authLinkFromSearch('#type=invite&token_hash=invite-token'), 'invite');
  assert.equal(authLinkFromSearch('?type=invite'), null);
  assert.equal(authLinkFromSearch('?token_hash=token&type=signup'), null);
});

test('invitation email uses a fixed activation URL with a visible fallback', () => {
  const invitationTemplate = readFileSync(
    fileURLToPath(new URL('../supabase/templates/invite.html', import.meta.url)),
    'utf8',
  );

  assert.match(
    invitationTemplate,
    /href="https:\/\/t6msport\.github\.io\/media-factory\/\?activate=invite"/,
  );
  assert.match(invitationTemplate, /<table role="presentation"/);
  assert.doesNotMatch(invitationTemplate, /target="_blank"/);
  assert.match(invitationTemplate, /Copy this address into your browser/);
  assert.match(invitationTemplate, /\{\{ \.Token \}\}/);
  assert.match(invitationTemplate, /\{\{ \.Email \}\}/);
  assert.doesNotMatch(invitationTemplate, /&/);
  assert.doesNotMatch(invitationTemplate, /\.TokenHash/);
  assert.doesNotMatch(invitationTemplate, /\.ConfirmationURL/);
  assert.doesNotMatch(invitationTemplate, /\.SiteURL/);
});

test('invitation activation accepts the delivered code without putting it in the URL', () => {
  assert.equal(normaliseInvitationCode('123 456'), '123456');
  assert.equal(normaliseInvitationCode('123-456'), '123456');

  const markup = renderToStaticMarkup(
    React.createElement(InviteActivationForm, {
      email: 'rich@example.com',
      activateInvitation: async () => {},
      showLogin: () => {},
    }),
  );

  assert.match(markup, /Activate your account/);
  assert.match(markup, /Driver name/);
  assert.match(markup, /Invitation code/);
  assert.match(markup, /Create password/);
  assert.match(markup, /Confirm password/);
  assert.doesNotMatch(markup, /token_hash/);
});

test('invited profiles replace the email fallback once and then lock the driver name', () => {
  const migration = readFileSync(
    fileURLToPath(new URL(
      '../supabase/migrations/202608010002_invited_profile_completion.sql',
      import.meta.url,
    )),
    'utf8',
  );

  assert.match(migration, /complete_invited_driver_profile/);
  assert.match(migration, /length\(clean_name\) > 80/);
  assert.match(migration, /jsonb_build_object\('driver_name', clean_name\)/);
  assert.match(migration, /Driver profile has already been completed/);
});

test('invited users are prompted to create their password', () => {
  const markup = renderToStaticMarkup(
    React.createElement(AuthPage, {
      data: starter,
      passwordSetupMode: 'invite',
      login: async () => {},
      activateInvitation: async () => {},
      showInviteActivation: () => {},
      hideInviteActivation: () => {},
      resendConfirmation: async () => {},
      resetPassword: async () => {},
      saveRecoveredPassword: async () => {},
    }),
  );

  assert.match(markup, /CLOSED BETA INVITE/);
  assert.match(markup, /Create your password/);
  assert.match(markup, /Activate account/);
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

test('closed beta login does not expose public account creation', () => {
  const markup = renderToStaticMarkup(
    React.createElement(AuthPage, {
      data: starter,
      login: async () => {},
      activateInvitation: async () => {},
      showInviteActivation: () => {},
      hideInviteActivation: () => {},
      resendConfirmation: async () => {},
      resetPassword: async () => {},
      saveRecoveredPassword: async () => {},
    }),
  );

  assert.match(markup, /CLOSED BETA/);
  assert.match(markup, /invited beta testers only/);
  assert.match(markup, /Request beta access/);
  assert.match(markup, /Forgot password/);
  assert.match(markup, /Activate an invitation/);
  assert.doesNotMatch(markup, /Create an account/);
  assert.doesNotMatch(markup, /Create account and continue/);
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
