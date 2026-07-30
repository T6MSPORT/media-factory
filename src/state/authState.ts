import type { Account, Data } from '../types';

export const MINIMUM_PASSWORD_LENGTH = 8;

export function validateRegistration(
  email: string,
  password: string,
  driverName: string,
): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('Enter a valid email address.');
  }
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new Error('Your password must be at least 8 characters.');
  }
  if (!driverName.trim()) {
    throw new Error('Driver name is required.');
  }
}

export function applyCloudAccount(
  data: Data,
  account: Account,
  signedIn = true,
): Data {
  return {
    ...data,
    onboardingComplete: true,
    profile: {
      ...data.profile,
      name: account.driverName,
      nameLocked: true,
    },
    authentication: {
      account,
      signedIn,
      lastEmail: account.email,
      pendingEmailConfirmation: !signedIn,
    },
  };
}

export function clearCloudSession(data: Data): Data {
  return {
    ...data,
    authentication: {
      ...data.authentication,
      signedIn: false,
      pendingEmailConfirmation: false,
    },
  };
}

export function markEmailConfirmationPending(
  data: Data,
  account: Account,
): Data {
  return applyCloudAccount(data, account, false);
}
