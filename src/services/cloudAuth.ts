import { createClient, type AuthChangeEvent, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Account } from '../types';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() ||
  'https://eqyybdqnwcqetlaqgjzi.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  'sb_publishable_rA8Mc164SPGI0Yd4l_a3Jg_RLi_8zlx';

type ProfileRow = {
  user_id: string;
  driver_name: string;
  created_at: string;
};

export type RegistrationResult = {
  account: Account;
  signedIn: boolean;
  needsEmailConfirmation: boolean;
};

export type AuthListener = (
  event: AuthChangeEvent,
  account: Account | null,
) => void;

let client: SupabaseClient | undefined;

export function isCloudAuthConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function getClient(): SupabaseClient {
  if (!isCloudAuthConfigured()) {
    throw new Error('Cloud login has not been configured yet.');
  }

  client ||= createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export function isEmailConfirmationError(error: unknown): boolean {
  return error instanceof Error &&
    error.message === 'Confirm your email before signing in.';
}

export function readableAuthError(message: string, code?: string): Error {
  const lower = message.toLowerCase();
  if (
    lower.includes('error sending confirmation email') ||
    lower.includes('error sending recovery email') ||
    lower.includes('confirmation email could not be sent') ||
    lower.includes('smtp')
  ) {
    return new Error(
      'The account email could not be sent. Check the Media Factory email service and try again.',
    );
  }
  if (
    code === 'over_email_send_rate_limit' ||
    lower.includes('email rate limit') ||
    lower.includes('rate limit exceeded')
  ) {
    return new Error('Too many account emails have been requested. Wait a few minutes and try again.');
  }
  if (lower.includes('invalid login credentials')) {
    return new Error('Email or password is incorrect.');
  }
  if (code === 'email_not_confirmed' || lower.includes('email not confirmed')) {
    return new Error('Confirm your email before signing in.');
  }
  if (lower.includes('user already registered')) {
    return new Error('An account already exists for this email.');
  }
  if (lower.includes('password')) {
    return new Error(message);
  }
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('connection')
  ) {
    return new Error('Media Factory could not reach cloud login. Check your connection and try again.');
  }
  return new Error('Cloud login is temporarily unavailable. Please try again.');
}

async function profileForUser(authClient: SupabaseClient, user: User): Promise<ProfileRow> {
  const { data, error } = await authClient
    .from('profiles')
    .select('user_id, driver_name, created_at')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    throw new Error('Your cloud driver profile could not be loaded.');
  }
  return data as ProfileRow;
}

function accountFrom(user: User, profile: ProfileRow): Account {
  if (!user.email) throw new Error('Your account does not have an email address.');
  return {
    id: user.id,
    email: user.email.trim().toLowerCase(),
    driverName: profile.driver_name,
    createdAt: profile.created_at,
  };
}

export async function currentCloudAccount(): Promise<Account | null> {
  const authClient = getClient();
  const { data, error } = await authClient.auth.getSession();
  if (error) throw readableAuthError(error.message);
  if (!data.session?.user) return null;
  return accountFrom(
    data.session.user,
    await profileForUser(authClient, data.session.user),
  );
}

export async function registerCloudAccount(
  email: string,
  password: string,
  driverName: string,
): Promise<RegistrationResult> {
  const authClient = getClient();
  const normalisedEmail = email.trim().toLowerCase();
  const name = driverName.trim();
  const { data, error } = await authClient.auth.signUp({
    email: normalisedEmail,
    password,
    options: {
      data: { driver_name: name },
      emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
    },
  });

  if (error) throw readableAuthError(error.message);
  if (!data.user) throw new Error('Cloud account creation did not complete.');
  if (data.user.identities?.length === 0) {
    throw new Error('An account already exists for this email.');
  }

  const profile = data.session
    ? await profileForUser(authClient, data.user)
    : {
        user_id: data.user.id,
        driver_name: name,
        created_at: data.user.created_at,
      };

  return {
    account: accountFrom(data.user, profile),
    signedIn: Boolean(data.session),
    needsEmailConfirmation: !data.session,
  };
}

export async function signInCloud(
  email: string,
  password: string,
): Promise<Account> {
  const authClient = getClient();
  const { data, error } = await authClient.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw readableAuthError(error.message, error.code);
  return accountFrom(
    data.user,
    await profileForUser(authClient, data.user),
  );
}

export async function signOutCloud(): Promise<void> {
  const { error } = await getClient().auth.signOut();
  if (error) throw readableAuthError(error.message);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await getClient().auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
  );
  if (error) throw readableAuthError(error.message);
}

export async function resendSignupConfirmation(email: string): Promise<void> {
  const { error } = await getClient().auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
    },
  });
  if (error) throw readableAuthError(error.message, error.code);
}

export async function updateCloudPassword(password: string): Promise<void> {
  const { error } = await getClient().auth.updateUser({ password });
  if (error) throw readableAuthError(error.message);
}

export function listenForCloudAuth(listener: AuthListener): () => void {
  const authClient = getClient();
  const { data } = authClient.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      if (!session?.user) {
        listener(event, null);
        return;
      }
      window.setTimeout(() => {
        void profileForUser(authClient, session.user)
          .then(profile => listener(event, accountFrom(session.user, profile)))
          .catch(() => listener(event, null));
      }, 0);
    },
  );
  return () => data.subscription.unsubscribe();
}
