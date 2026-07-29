import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { registerAccount, signIn, signOut } = await server.ssrLoadModule(
  '/src/state/authState.ts',
);
const { normaliseData, starter } = await server.ssrLoadModule('/src/store.ts');

after(() => server.close());

const registration = {
  email: ' Rich@Example.com ',
  password: 'correct-horse',
  profile: {
    ...starter.profile,
    name: ' Rich Weatherill ',
    number: ' 46 ',
    team: ' T6 Msport ',
    driverImage: 'data:image/webp;base64,driver',
  },
};

test('registration creates a signed-in account and locks the confirmed driver name', async () => {
  const registered = await registerAccount(starter, registration, {
    now: () => '2026-07-29T12:00:00.000Z',
  });

  assert.equal(registered.authentication.signedIn, true);
  assert.equal(registered.authentication.account.email, 'rich@example.com');
  assert.equal(registered.authentication.account.driverName, 'Rich Weatherill');
  assert.equal(registered.authentication.account.createdAt, '2026-07-29T12:00:00.000Z');
  assert.notEqual(registered.authentication.account.passwordHash, registration.password);
  assert.equal(registered.profile.name, 'Rich Weatherill');
  assert.equal(registered.profile.number, '46');
  assert.equal(registered.profile.team, 'T6 Msport');
  assert.equal(registered.profile.nameLocked, true);
  assert.equal(registered.onboardingComplete, true);
});

test('a returning driver can sign out and sign back in with normalised email', async () => {
  const registered = await registerAccount(starter, registration);
  const signedOut = signOut(registered);
  const signedIn = await signIn(
    signedOut,
    'RICH@example.com',
    registration.password,
  );

  assert.equal(signedOut.authentication.signedIn, false);
  assert.equal(signedIn.authentication.signedIn, true);
  assert.equal(signedIn.profile.name, 'Rich Weatherill');
});

test('incorrect login details never create a session', async () => {
  const registered = signOut(await registerAccount(starter, registration));

  await assert.rejects(
    () => signIn(registered, registration.email, 'wrong-password'),
    /Email or password is incorrect/,
  );
  assert.equal(registered.authentication.signedIn, false);
});

test('registration rejects incomplete identity and weak account details', async () => {
  await assert.rejects(
    () => registerAccount(starter, { ...registration, email: 'not-an-email' }),
    /valid email/,
  );
  await assert.rejects(
    () => registerAccount(starter, { ...registration, password: 'short' }),
    /at least 8 characters/,
  );
  await assert.rejects(
    () =>
      registerAccount(starter, {
        ...registration,
        profile: { ...registration.profile, name: '' },
      }),
    /name and car number are required/,
  );
});

test('saved accounts normalise safely and keep the identity lock', async () => {
  const registered = await registerAccount(starter, registration);
  const restored = normaliseData({
    ...registered,
    profile: { ...registered.profile, name: 'Tampered Driver' },
  });

  assert.equal(restored.authentication.account.email, 'rich@example.com');
  assert.equal(restored.authentication.signedIn, true);
  assert.equal(restored.profile.name, 'Rich Weatherill');
  assert.equal(restored.profile.nameLocked, true);
});
