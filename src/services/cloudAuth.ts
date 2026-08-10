import { createClient, type AuthChangeEvent, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Account } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

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
  error?: Error,
) => void;

let client: SupabaseClient | undefined;

export function isCloudAuthConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getCloudClient(): SupabaseClient {
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

type AuthOperation = 'general' | 'recovery' | 'invite';

export function readableAuthError(
  message: string,
  code?: string,
  operation: AuthOperation = 'general',
): Error {
  const trimmed = message.trim();
  const lower = message.toLowerCase();
  // Some Supabase SMTP failures currently arrive at the browser with an empty
  // JSON object as their message. Keep recovery failures actionable instead of
  // exposing the provider's unhelpful `Account service error: {}` response.
  if (operation === 'recovery' && (trimmed === '{}' || !trimmed)) {
    return new Error(
      'The password reset email could not be sent. Check the Media Factory email service and try again.',
    );
  }
  if (
    operation === 'invite' &&
    (
      lower.includes('token has expired') ||
      lower.includes('token is invalid') ||
      lower.includes('invalid token') ||
      lower.includes('otp expired') ||
      lower.includes('invalid otp')
    )
  ) {
    return new Error(
      'The invitation code is incorrect or has expired. Ask for a new invitation and try again.',
    );
  }
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
  const providerCode = code ? ` (${code})` : '';
  return new Error(`Account service error: ${message}${providerCode}`);
}

async function profileForUser(authClient: SupabaseClient, user: User): Promise<ProfileRow> {
  const { data, error } = await authClient
    .from('profiles')
    .select('user_id, driver_name, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error('Your cloud driver profile could not be loaded.');
  }
  if (data) return data as ProfileRow;

  // New deployments expose this repair RPC. It recreates a missing profile
  // from the immutable name captured when the auth user was registered.
  const { data: repaired, error: repairError } = await authClient.rpc('ensure_driver_profile');
  const repairedRow = Array.isArray(repaired) ? repaired[0] : repaired;
  if (repairedRow?.user_id && repairedRow?.driver_name) {
    return repairedRow as ProfileRow;
  }

  throw new Error(
    repairError
      ? 'Your driver profile is missing and automatic repair is not available.'
      : 'Your driver profile is missing and could not be repaired.',
  );
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
  const authClient = getCloudClient();
  const { data, error } = await authClient.auth.getSession();
  if (error) throw readableAuthError(error.message, error.code);
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
  const authClient = getCloudClient();
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

  if (error) throw readableAuthError(error.message, error.code);
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
  const authClient = getCloudClient();
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
  const { error } = await getCloudClient().auth.signOut();
  if (error) throw readableAuthError(error.message);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await getCloudClient().auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
  );
  if (error) throw readableAuthError(error.message, error.code, 'recovery');
}

export async function resendSignupConfirmation(email: string): Promise<void> {
  const { error } = await getCloudClient().auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
    },
  });
  if (error) throw readableAuthError(error.message, error.code);
}

export async function updateCloudPassword(password: string): Promise<void> {
  const { error } = await getCloudClient().auth.updateUser({ password });
  if (error) throw readableAuthError(error.message, error.code);
}

export function normaliseInvitationCode(code: string): string {
  return code.replace(/[\s-]/g, '');
}

export async function activateInvitedCloudAccount(
  email: string,
  code: string,
  password: string,
  driverName: string,
): Promise<Account> {
  const authClient = getCloudClient();
  const normalisedEmail = email.trim().toLowerCase();
  const token = normaliseInvitationCode(code);
  const name = driverName.trim();
  if (!name || name.length > 80) {
    throw new Error('Driver name is required and must be 80 characters or fewer.');
  }
  const { data, error } = await authClient.auth.verifyOtp({
    email: normalisedEmail,
    token,
    type: 'invite',
  });

  if (error) throw readableAuthError(error.message, error.code, 'invite');
  if (!data.user || !data.session) {
    throw new Error('The invitation could not be activated. Ask for a new invitation and try again.');
  }

  const { data: completedProfile, error: profileError } = await authClient.rpc(
    'complete_invited_driver_profile',
    { requested_driver_name: name },
  );
  if (profileError) {
    throw new Error('Your driver name could not be saved. Please try again.');
  }

  const { error: passwordError } = await authClient.auth.updateUser({ password });
  if (passwordError) throw readableAuthError(passwordError.message, passwordError.code, 'invite');

  const profile = Array.isArray(completedProfile) ? completedProfile[0] : completedProfile;
  if (!profile?.user_id || !profile?.driver_name) {
    throw new Error('Your driver name could not be saved. Please try again.');
  }

  return accountFrom(data.user, profile as ProfileRow);
}

export type AuthLinkResult = 'invite' | 'recovery' | null;

function authLinkParams(value: string): URLSearchParams {
  return new URLSearchParams(value.replace(/^[?#]/, ''));
}

export function authLinkFromSearch(value: string): Exclude<AuthLinkResult, null> | null {
  const params = authLinkParams(value);
  if (params.get('invite')) return 'invite';
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  return tokenHash && (type === 'invite' || type === 'recovery') ? type : null;
}

export async function consumeAuthLink(): Promise<AuthLinkResult> {
  const source = authLinkFromSearch(window.location.search)
    ? window.location.search
    : window.location.hash;
  const params = authLinkParams(source);
  const tokenHash = params.get('invite') ?? params.get('token_hash');
  const type = authLinkFromSearch(source);

  if (!tokenHash || !type) return null;

  const { error } = await getCloudClient().auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  if (error) throw readableAuthError(error.message, error.code);

  window.history.replaceState({}, document.title, window.location.pathname);
  return type;
}

export function listenForCloudAuth(listener: AuthListener): () => void {
  const authClient = getCloudClient();
  const { data } = authClient.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      if (!session?.user) {
        listener(event, null);
        return;
      }
      window.setTimeout(() => {
        void profileForUser(authClient, session.user)
          .then(profile => listener(event, accountFrom(session.user, profile)))
          .catch(reason => listener(
            event,
            null,
            reason instanceof Error ? reason : new Error('Your cloud profile could not be loaded.'),
          ));
      }, 0);
    },
  );
  return () => data.subscription.unsubscribe();
}
