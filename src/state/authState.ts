import type { Data, DriverProfile } from '../types';

const PASSWORD_ITERATIONS = 120_000;
const MINIMUM_PASSWORD_LENGTH = 8;

type RegisterInput = {
  email: string;
  password: string;
  profile: DriverProfile;
};

type AuthDependencies = {
  crypto?: Crypto;
  now?: () => string;
};

const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array): string {
  let value = '';
  bytes.forEach(byte => {
    value += String.fromCharCode(byte);
  });
  return btoa(value);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const decoded = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length));
  decoded.split('').forEach((character, index) => {
    bytes[index] = character.charCodeAt(0);
  });
  return bytes;
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  cryptoProvider: Crypto,
): Promise<string> {
  const key = await cryptoProvider.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await cryptoProvider.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PASSWORD_ITERATIONS,
    },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

export async function registerAccount(
  data: Data,
  input: RegisterInput,
  dependencies: AuthDependencies = {},
): Promise<Data> {
  const cryptoProvider = dependencies.crypto || globalThis.crypto;
  const email = normaliseEmail(input.email);
  const name = input.profile.name.trim();
  const number = input.profile.number.trim();

  if (data.authentication.account) {
    throw new Error('An account already exists on this browser.');
  }
  if (!validateEmail(email)) {
    throw new Error('Enter a valid email address.');
  }
  if (input.password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new Error('Your password must be at least 8 characters.');
  }
  if (!name || !number) {
    throw new Error('Driver name and car number are required.');
  }

  const salt = cryptoProvider.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const passwordHash = await hashPassword(input.password, salt, cryptoProvider);

  return {
    ...data,
    onboardingComplete: true,
    profile: {
      ...input.profile,
      name,
      number,
      team: input.profile.team.trim(),
      nameLocked: true,
    },
    authentication: {
      account: {
        email,
        driverName: name,
        passwordHash,
        passwordSalt: bytesToBase64(salt),
        createdAt: (dependencies.now || (() => new Date().toISOString()))(),
      },
      signedIn: true,
    },
  };
}

export async function signIn(
  data: Data,
  email: string,
  password: string,
  cryptoProvider: Crypto = globalThis.crypto,
): Promise<Data> {
  const account = data.authentication.account;
  if (!account) {
    throw new Error('No account exists on this browser yet.');
  }

  const passwordHash = await hashPassword(
    password,
    base64ToBytes(account.passwordSalt),
    cryptoProvider,
  );

  if (
    normaliseEmail(email) !== account.email ||
    passwordHash !== account.passwordHash
  ) {
    throw new Error('Email or password is incorrect.');
  }

  return {
    ...data,
    authentication: { ...data.authentication, signedIn: true },
  };
}

export function signOut(data: Data): Data {
  return {
    ...data,
    authentication: { ...data.authentication, signedIn: false },
  };
}
